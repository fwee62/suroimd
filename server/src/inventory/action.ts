import { AnimationType, GameConstants, PlayerActions } from "@common/constants";
import { HealType, type HealingItemDefinition } from "@common/definitions/healingItems";
import { Loots } from "@common/definitions/loots";
import { PerkIds, Perks } from "@common/definitions/perks";
import { Numeric } from "@common/utils/math";
import { type Timeout } from "@common/utils/misc";
import { type ReifiableDef } from "@common/utils/objectDefinitions";
import { type Player } from "../objects/player";
import { type GunItem } from "./gunItem";
import { CircleHitbox } from "@common/utils/hitbox";

export abstract class Action {
    readonly player: Player;

    private readonly _timeout: Timeout;

    abstract get type(): PlayerActions;

    readonly speedMultiplier: number = 1;

    protected constructor(player: Player, time: number) {
        this.player = player;
        this._timeout = player.game.addTimeout(this.execute.bind(this), time * 1000);
        this.player.setPartialDirty();
    }

    cancel(): void {
        this._timeout.kill();
        this.player.action = undefined;
        this.player.setPartialDirty();
    }

    execute(): void {
        if (this.player.downed) return;
        this.player.action = undefined;
        this.player.setPartialDirty();
    }
}

export class ReviveAction extends Action {
    private readonly _type = PlayerActions.Revive;
    override get type(): PlayerActions.Revive { return this._type; }

    override readonly speedMultiplier = 0.5;

    constructor(reviver: Player, readonly target: Player) {
        super(reviver, GameConstants.player.reviveTime / reviver.mapPerkOrDefault(PerkIds.FieldMedic, ({ usageMod }) => usageMod, 1));
    }

    override execute(): void {
        super.execute();
        
        if(this.player.hasPerk(PerkIds.HealingAura)){
            //@ts-ignore
            const hhb=new CircleHitbox(Perks.fromString(PerkIds.HealingAura).radius*this.player.sizeMod,this.player.position)
            const objs=this.player.game.grid.intersectsHitbox(hhb)
            for(const o of objs){
                if(o.isPlayer&&o.downed&&hhb.isPointInside(o.position)&&(o.isAllie(this.player))){
                    o.revive()
                }
            }
            this.player.setDirty()
        }else{
            this.target.revive();
            this.player.animation = AnimationType.None;
        }
        this.player.setDirty();
    }

    override cancel(): void {
        super.cancel();

        this.target.beingRevivedBy = undefined;
        this.target.setDirty();

        this.player.animation = AnimationType.None;
        this.player.setDirty();
    }
}

export class ReloadAction extends Action {
    private readonly _type = PlayerActions.Reload;
    override get type(): PlayerActions.Reload { return this._type; }

    readonly fullReload: boolean;

    constructor(player: Player, readonly item: GunItem) {
        const fullReload = item.definition.reloadFullOnEmpty && item.ammo <= 0;
        super(
            player,
            fullReload ? item.definition.fullReloadTime : item.definition.reloadTime
        );
        this.fullReload = !!fullReload;
    }

    override execute(): void {
        super.execute();

        const items = this.player.inventory.items;
        const definition = this.item.definition;

        const capacity = this.player.hasPerk(PerkIds.ExtendedMags)
            ? definition.extendedCapacity ?? definition.capacity
            : definition.capacity;

        const hasInfiniteAmmo = this.player.hasPerk(PerkIds.InfiniteAmmo)||this.player.infinityAmmo||definition.infiniteAmmo;

        const desiredLoad = Numeric.min(
            definition.shotsPerReload !== undefined && !this.fullReload
                ? (definition.isDual ? 2 : 1) * definition.shotsPerReload
                : capacity,
            capacity - this.item.ammo
        );

        const toLoad = hasInfiniteAmmo
            ? desiredLoad
            : Numeric.min(
                items.getItem(definition.ammoType),
                desiredLoad
            );

        this.item.ammo += toLoad;
        if (!hasInfiniteAmmo) {
            items.decrementItem(definition.ammoType, toLoad);
        }

        if (this.item.ammo < capacity) { // chain reloads if not full
            this.item.reload();
        }

        this.player.attacking = false;
        this.player.dirty.weapons = true;
        this.player.dirty.items = true;
        this.player.dirty.capacity=true
    }
}

export class HealingAction extends Action {
    private readonly _type = PlayerActions.UseItem;
    override get type(): PlayerActions.UseItem { return this._type; }

    readonly item: HealingItemDefinition;
    override readonly speedMultiplier = 0.5;

    constructor(player: Player, item: ReifiableDef<HealingItemDefinition>) {
        const itemDef = Loots.reify<HealingItemDefinition>(item);
        super(
            player,
            itemDef.useTime / player.mapPerkOrDefault(PerkIds.FieldMedic, ({ usageMod }) => usageMod, 1)
        );
        this.item = itemDef;
    }

    override execute(): void {
        super.execute();

        this.player.inventory.items.decrementItem(this.item.idString);

        if(this.player.hasPerk(PerkIds.HealingAura)){
            //@ts-ignore
            const hhb=new CircleHitbox(Perks.fromString(PerkIds.HealingAura).radius*this.player.sizeMod,this.player.position)
            const objs=this.player.game.grid.intersectsHitbox(hhb)
            for(const o of objs){
                if(o.isPlayer&&!o.downed&&hhb.isPointInside(o.position)&&(o.isAllie(this.player))){
                    if(this.item.healType==HealType.Adrenaline){
                        o.adrenaline+=this.item.restoreAmount
                    }else{
                        o.health+=this.item.restoreAmount
                    }
                }
            }
            this.player.setDirty()
        }else{
            switch (this.item.healType) {
                case HealType.Health:
                    this.player.health += this.item.restoreAmount;
                    break;
                case HealType.Adrenaline:
                    this.player.adrenaline += this.item.restoreAmount;
                    break;
            }
        }
        this.player.dirty.items = true;
        this.player.dirty.capacity=true;
    }
}

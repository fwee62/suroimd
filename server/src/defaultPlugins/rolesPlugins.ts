import { pickRandomInArray, random } from "@common/utils/random";
import { Gamerole } from "../data/gamemode";
import { type Game } from "../game";
import { GamePlugin } from "../pluginManager";
import { type Player } from "../objects/player";

/**
 * Plugin to toggle the player speed when sending an emote
 */
export class StartWithRolePlugin extends GamePlugin {
    protected override initListeners(params:Gamerole): void {
        this.on("player_did_join", ({ player }) => {
            player.giveGamerole(params,false)
        });
    }
}
export interface GiveRoleAfterStartArgs{
    role:Gamerole|Gamerole[]
    group:{
        needGroup?:boolean
        group:number
        canDowned?:boolean
    }
    afterTime?:number
    count?:number
}
export class GiveRoleAfterStartPlugin extends GamePlugin {
    protected override initListeners(params:GiveRoleAfterStartArgs): void {
        this.on("game_started", (game) => {
            if(params.afterTime){
                game.addTimeout(this.give.bind(this,game,params),params.afterTime*1000)
            }else{
                this.give(game,params)
            }
        });
    }
    give(game:Game,params:GiveRoleAfterStartArgs){
        const chooses=Array.from(this.game.livingPlayers.values())
        if(params.count){
            for(let i=0;i<params.count;i++){
                const gived=this.giveTo(game,params,undefined,chooses)
                if(!gived)break
            }
        }else{
            this.giveTo(game,params,undefined,chooses)
        }
    }
    giveTo(game:Game,params:GiveRoleAfterStartArgs,attempts:number=20,chooses:Player[]=[]):boolean{
        let lastChoose=-1
        for(let i=0;i<attempts;i++){
            if(lastChoose!==-1){
                chooses.splice(lastChoose,1)
            }
            if(chooses.length===0){
                break
            }
            lastChoose=random(0,chooses.length-1)
            const player=chooses[lastChoose]
            if(player.disconnected||player.isNpc){
                continue
            }
            if(params.group.needGroup&&player.groupID!==params.group.group){
                continue
            }
            if(player.gamerole){
                continue
            }
            player.giveGamerole(Array.isArray(params.role)?pickRandomInArray(params.role):params.role,true)
            if(!params.group.needGroup){
                player.game.addPlayerIntoGroup(player,params.group.group)
            }
            return true
        }
        return false
    }
}
export interface GiveRoleAfterDownsArgs{
    role:Gamerole|Gamerole[]
    group:number
    preferenceRole?:string
    count?:number
}
export class GiveRoleAfterDownsPlugin extends GamePlugin {
    alreadyGived:boolean=false
    protected override initListeners(params:GiveRoleAfterDownsArgs): void {
        this.on("player_did_down", (ds) => {
            if(ds.player.groupID!==params.group||!ds.player.group||this.alreadyGived){
                return
            }
            this.alreadyGived=true
            const chooses=ds.player.group.getNotDownedPlayers()
            if(chooses.length>(params.count??1)){
                return
            }
            if(params.count){
                for(let i=0;i<params.count;i++){
                    const gived=this.giveTo(params,undefined,chooses)
                    if(!gived)break
                }
            }else{
                this.giveTo(params,undefined,chooses)
            }
        });
    }
    giveTo(params:GiveRoleAfterDownsArgs,attempts:number=20,chooses:Player[]=[]):boolean{
        let lastChoose=-1
        for(let i=0;i<attempts;i++){
            if(lastChoose!==-1){
                chooses.splice(lastChoose,1)
            }
            if(chooses.length===0){
                break
            }
            lastChoose=random(0,chooses.length-1)
            if(params.preferenceRole){
                for(let ii=0;ii<chooses.length;ii++){
                    if(chooses[ii].role===params.preferenceRole){
                        lastChoose=ii
                    }
                }
            }
            const player=chooses[lastChoose]
            if(player.disconnected||player.isNpc){
                continue
            }
            if(player.groupID!==params.group){
                continue
            }
            player.giveGamerole(Array.isArray(params.role)?pickRandomInArray(params.role):params.role,true)
            return true
        }
        return false
    }
}
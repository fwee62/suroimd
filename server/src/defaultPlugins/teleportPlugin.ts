import { Vec } from "@common/utils/vector";

import { GamePlugin } from "../pluginManager";

/**
 * Plugin to teleport a player to a map ping when they send one
 */
export class TeleportPlugin extends GamePlugin {
    protected override initListeners(_params:unknown): void {
        this.on("player_did_map_ping", ({ player, position }) => {
            player.position = Vec.clone(position);
            player.updateObjects = true;
            player.setPartialDirty();
        });
    }
}

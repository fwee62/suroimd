import { ItemType, ObjectDefinitions, type InventoryItemDefinition, type ReferenceTo } from "../utils/objectDefinitions";
import { Vec, type Vector } from "../utils/vector";
import { type ExplosionDefinition } from "./explosions";
import { type SyncedParticleSpawnerDefinition } from "./syncedParticles";

export type ThrowableDefinition = InventoryItemDefinition & {
    readonly itemType: ItemType.Throwable
    /**
     * Specified in *milliseconds*
     */
    readonly fuseTime: number
    /**
     * Note: setting this higher than `fuseTime` guarantees that the grenade detonates in the user's hands,
     * except if they drop it at their feet and run away
     */
    readonly cookTime: number
    /**
     * Only used client-side, dictates the duration of the throwing animation
     */
    readonly throwTime: number
    /**
     * Whether cooking the grenade will run down the fuse
     */

    readonly zDecay:number
    readonly zScaleA:number
    readonly zBaseScale:number

    readonly size:number

    readonly cookable: boolean
    readonly c4: boolean
    readonly health?: number
    readonly noSkin?: boolean
    readonly cookSpeedMultiplier: number
    readonly maxThrowDistance: number
    readonly image: {
        readonly position: Vector
        readonly angle?: number
        // no relation to the ZIndexes enum
        readonly zIndex: number
    }
    readonly speedCap: number
    readonly hitboxRadius: number
    readonly fireDelay: number
    readonly detonation: {
        readonly explosion?: ReferenceTo<ExplosionDefinition>
        readonly particles?: SyncedParticleSpawnerDefinition
        readonly spookyParticles?: SyncedParticleSpawnerDefinition
    }
    readonly animation: {
        readonly pinImage?: string
        readonly liveImage: string
        readonly leverImage?: string
        readonly activatedImage?: string
        readonly cook: {
            readonly cookingImage?: string
            readonly leftFist: Vector
            readonly rightFist: Vector
        }
        readonly throw: {
            readonly leftFist: Vector
            readonly rightFist: Vector
        }
    }
} & ({
    readonly impactDamage: number
    /**
     * Applies to impact damage and not explosion damage
     */
    readonly obstacleMultiplier?: number
} | {
    readonly impactDamage?: undefined
});

export const Throwables = ObjectDefinitions.withDefault<ThrowableDefinition>()(
    "Throwables",
    {
        itemType: ItemType.Throwable,
        speedMultiplier: 1,
        size:0.7,
        cookable: false,
        fuseTime: 4000,
        cookTime: 150,
        c4: false,
        throwTime: 150,
        noDrop: false,
        cookSpeedMultiplier: 0.7,
        hitboxRadius: 1,
        impactDamage: 0,
        zDecay:0.001,
        zScaleA:.6,
        zBaseScale:.6,
        obstacleMultiplier: 20,
        image: {
            zIndex: 5
        },
        maxThrowDistance: 150,
        fireDelay: 250,
        speedCap: Infinity
    },
    () => [
        {
            idString: "frag_grenade",
            name: "Frag Grenade",
            fuseTime: 4000,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "frag_grenade_explosion",
                subthrowable:undefined
            },
            animation: {
                pinImage: "proj_frag_pin",
                liveImage: "proj_frag",
                leverImage: "proj_frag_lever",
                cook: {
                    cookingImage: "proj_frag_nopin",
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        },
        {
            idString: "mirv_grenade",
            name: "Mirv Grenade",
            fuseTime: 4000,
            size:0.9,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "mirv_grenade_explosion",
            },
            animation: {
                pinImage: "proj_frag_pin",
                liveImage: "proj_mirv",
                leverImage: "proj_frag_lever",
                cook: {
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        },
        {
            idString: "mirv_subgrenade",
            name: "Mirv Sub Grenade",
            fuseTime: 2000,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "submirv_grenade_explosion",
            },
            animation: {
                pinImage: "proj_frag_pin",
                liveImage: "proj_submirv",
                leverImage: "proj_frag_lever",
                cook: {
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        },
        {
            idString: "airstrike_bomb",
            name: "Strobe",
            fuseTime: 1100,
            impactDamage: 1,
            obstacleMultiplier: 20,
            speedMultiplier:0,
            speedCap:0,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "airstrike_bomb_explosion",
            },
            animation: {
                pinImage: "proj_frag_pin",
                liveImage: "proj_airstrike_bomb",
                leverImage: "proj_frag_lever",
                cook: {
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            },
            zDecay:0.001,
            zScaleA:1
        },
        {
            idString: "airstrike",
            name: "Airstrike",
            fuseTime: 3000,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "airstrike_explosion",
            },
            animation: {
                liveImage: "proj_airstrike",
                cook: {
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            },
            size:2,
        },
        {
            idString: "tactical_nuke",
            name: "Tactical Nuke",
            fuseTime: 2000,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "tactical_nuke_explosion",
            },
            animation: {
                liveImage: "proj_tactical_nuke",
                cook: {
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            },
            zDecay:0.0005,
            zScaleA:1,
            speedMultiplier:0,
            speedCap:0,
            size:2,
        },
        {
            idString: "ice_grenade",
            name: "Ice Grenade",
            fuseTime: 2000,
            size:0.8,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "ice_grenade_explosion",
                subthrowable:undefined
            },
            animation: {
                pinImage: "proj_frag_pin",
                liveImage: "proj_ice",
                leverImage: "proj_frag_lever",
                cook: {
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        },
        {
            idString: "smoke_grenade",
            name: "Smoke Grenade",
            fuseTime: 2000,
            cookTime: 150,
            size:0.5,
            throwTime: 150,
            impactDamage: 1,
            obstacleMultiplier: 20,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "smoke_grenade_explosion",
                spookyParticles: {
                    type: "plumpkin_smoke_grenade_particle",
                    count: 10,
                    deployAnimation: {
                        duration: 4000,
                        staggering: {
                            delay: 300,
                            initialAmount: 2
                        }
                    },
                    spawnRadius: 15
                },
                particles: {
                    type: "smoke_grenade_particle",
                    count: 10,
                    deployAnimation: {
                        duration: 4000,
                        staggering: {
                            delay: 300,
                            initialAmount: 2
                        }
                    },
                    spawnRadius: 15
                }
            },
            animation: {
                pinImage: "proj_smoke_pin",
                liveImage: "proj_smoke",
                leverImage: "proj_smoke_lever",
                cook: {
                    cookingImage: "proj_smoke_nopin",
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        },
        {
            idString: "confetti_grenade",
            name: "Confetti Grenade",
            fuseTime: 4000,
            cookTime: 150,
            noSkin: true,
            throwTime: 150,
            impactDamage: 1,
            obstacleMultiplier: 20,
            cookable: true,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "confetti_grenade_explosion"
            },
            animation: {
                pinImage: "proj_frag_pin",
                liveImage: "proj_confetti",
                leverImage: "proj_frag_lever",
                cook: {
                    cookingImage: "proj_confetti_nopin",
                    leftFist: Vec.create(2.5, 0),
                    rightFist: Vec.create(-0.5, 2.15)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        },
        {
            idString: "c4",
            name: "C4",
            c4: true,
            zScaleA:.7,
            zBaseScale:.6,
            health: 40,
            zDecay:0.002,
            image: {
                position: Vec.create(60, 43),
                angle: 60
            },
            detonation: {
                explosion: "c4_explosion"
            },
            animation: {
                liveImage: "proj_c4",
                activatedImage: "proj_c4_activated",
                cook: {
                    leftFist: Vec.create(2, -1),
                    rightFist: Vec.create(3, 0)
                },
                throw: {
                    leftFist: Vec.create(1.9, -1.75),
                    rightFist: Vec.create(4, 2.15)
                }
            }
        }
    ]
);

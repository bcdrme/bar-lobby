/**
 * @fileoverview Comms API
 *
 * This class is a extension of the TachyonClient class. It is used to communicate with the server.
 * all communication with the server should be done through this class.
 *
 * this includes matchmaking, chat, direct messages, and other lobby related functions.
 */
import { TachyonClient } from "tachyon-client";

export class CommsAPI extends TachyonClient {
    constructor(config: ConstructorParameters<typeof TachyonClient>[0]) {
        super({
            ...config,
        });
    }
}

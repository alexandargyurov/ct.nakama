import { Client } from "@heroiclabs/nakama-js";
import { v4 as uuidv4 } from "uuid";

import Logger from "./logger"

class Nakama {
    constructor(clientHost, clientPort, useSSL) {
        this.useSSL = useSSL;
        this.client = new Client("defaultkey", clientHost, clientPort, this.useSSL);

        this.session;
        this.socket;

        this.currentMatch;
        this.connectedOpponents = [];
    }

    initiate = async () => {
        Logger.log("ct.nakama has loaded!", "✨");

        await this.checkSessionAndAuthenticate()
        await this.establishSocketConnection()
        // await this.joinMatch("1dbae998-b50a-4d87-a991-0c7004a290f3.nakama1")  // TODO: REMOVE ME FOR TESTING ONLY
    }

    appendToConnectedOpponents = (newlyConnectedOpponents) => {
        this.connectedOpponents = this.connectedOpponents.concat(newlyConnectedOpponents);
        Logger.log("connectedOpponents updated with newly joined opponents");
    }

    removeFromConnectedOpponents = (newlyLeftOpponents) => {
        this.connectedOpponents = this.connectedOpponents.filter(function (co) {
            let stillConnectedOpponent = true;
            newlyLeftOpponents.forEach((leftOpponent) => {
                if (leftOpponent.user_id == co.user_id) {
                    stillConnectedOpponent = false;
                }
            });
            return stillConnectedOpponent;
        });

        Logger.log("connectedOpponents updated with newly left opponents");
    }

    checkSessionAndAuthenticate = async () => {
        // Checks browser for session and authenticates with server
        let existingUser = localStorage.getItem("browserSession");
        if (existingUser) {
            this.session = await this.client.authenticateCustom(
                existingUser,
                false,
                existingUser
            );
        } else {
            const newUser = uuidv4();

            localStorage.setItem("browserSession", newUser);
            this.session = await this.client.authenticateCustom(newUser, true, newUser);
        }

        Logger.success("Authenticated Session");
    };

    establishSocketConnection = async () => {
        // Create connection to the server via websockets
        const trace = false;
        this.socket = this.client.createSocket(this.useSSL, trace);
        await this.socket.connect(this.session);

        Logger.success("Established Websocket Connection");
    };

    createGame = async () => {
        const newMatchID = await this.client.rpc(this.session, "create_match_rpc", {});
        Logger.log("New Match Created: %o", newMatchID);
    }

    joinMatch = async (matchID) => {
        this.currentMatch = await this.socket.joinMatch(matchID);

        // for each person in the game add them to the connectedOpponents list
        this.currentMatch.presences.forEach((opponent) => {
            this.connectedOpponents = [opponent, ...this.connectedOpponents];
        });

        Logger.success("Joined Match")
    }
}

export default new Nakama("/*%clientHost%*/", "/*%clientPort%*/", [/*%useSSL%*/][0])

import { DefaultSocket, Session } from "@heroiclabs/nakama-js";

interface Nakama {
    /**
     * Nakama socket for communicating with the server
     */
    socket: DefaultSocket;

    /**
    * Current Nakama session of the player
    */
    session: Session;

    /**
    * Current state of the session, defaults to an empty object. Useful for storing players etc. 
    */
    state: object;
}
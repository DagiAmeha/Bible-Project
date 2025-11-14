import type { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Socket } from "net";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: {
      io?: SocketIOServer;
    };
  };
};

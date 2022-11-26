import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  next: (message: string) => void;
}
interface ClientToServerEvents {
  shoarFromAdmin: (shoar: string) => void;
  ping: (cb: () => void) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://24.48.6.239:3000",
  {
    auth: {
      token: "montrealAdmin",
    },
  }
);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [value, setValue] = useState("");
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    const pinger = setInterval(() => {
      const start = Date.now();

      socket.emit("ping", () => {
        const duration = Date.now() - start;
        setLatency(duration);
      });
    }, 2000);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      clearInterval(pinger);
    };
  }, []);

  const onSend: () => void = () => {
    socket.emit("shoarFromAdmin", value);
  };

  return (
    <div>
      <header>
        <h1>
          Is Connected: {String(isConnected)} -- Latency: {latency}
        </h1>
      </header>
      <main>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={onSend}>Broadcast Shoar</button>
      </main>
    </div>
  );
}

export default App;

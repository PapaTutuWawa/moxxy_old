export interface AltConnection {
    websocketUrl: string;
    boshUrl: string;
}

// TODO: Check if https or wss is used
export function discoverAltConnections(serverJid: string): Promise<AltConnection> {
    // TODO: Implement DNS-based lookup and XML-based lookup
    return new Promise<AltConnection>((res, rej) => {
        fetch(`https://${serverJid}/.well-known/host-meta.json`)
            .then(response => response.json())
            .then(data => {
                const transports: AltConnection = {
                    boshUrl: "",
                    websocketUrl: ""
                }
                data.links.forEach((link: any) => {
                    switch(link.rel) {
                        case "urn:xmpp:alt-connections:xbosh":
                            transports.boshUrl = link.href;
                            break
                        case "urn:xmpp:alt-connections:websocket":
                            transports.websocketUrl = link.href;
                            break
                    }
                });

                res(transports);
            })
            .catch(err => rej(err))
    });
}
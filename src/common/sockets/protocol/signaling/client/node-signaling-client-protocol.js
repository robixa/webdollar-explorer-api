import {nodeProtocol, nodeFallBackInterval} from '../../../../../consts/const_global.js';

import {SignalingClientList} from './signaling-client-list/signaling-client-list'
import {NodeWebPeer} from './../../../../../node/webrtc/web_peer/node-web-peer'

class NodeSignalingClientProtocol {

    constructor(){
        console.log("NodeSignalingClientProtocol constructor");
    }

    /*
        Signaling Server Service
     */

    initializeSignalingClientService(socket, params) {

        socket.on("signals/client/generate-initiator-signal", async (data) => {

            let addressToConnect = data.address;

            let webPeerSignalingClientListObject = SignalingClientList.registerWebPeerSignalingClientListBySignal(undefined, true);


            let webPeer = webPeerSignalingClientListObject.webPeer;

            console.log("###################### signals/client/generate-initiator-signal/"+data.id, webPeer.peer.signalData, typeof webPeer.peer.signalData);

            await webPeer.createSignal(undefined);
            let signal = webPeer.peer.signalData;

            console.log("###################### signals/client/generate-initiator-signal/"+data.id, signal, typeof signal);

            socket.node.sendRequest("signals/client/generate-initiator-signal/" + data.id, {
                accepted: true,
                initiatorSignal: signal,
            });

        });

        socket.on("signals/client/generate-answer-signal", async (data) => {

            let addressToConnect = data.address;

            let webPeerSignalingClientListObject = SignalingClientList.registerWebPeerSignalingClientListBySignal(undefined, false);

            let webPeer = webPeerSignalingClientListObject.webPeer;

            console.log("################# signals/client/generate-answer-signal",  webPeer, data.initiatorSignal);

            await webPeer.createSignal(data.initiatorSignal);
            let signal = webPeer.peer.signalData;

            console.log("################# signals/client/generate-answer-signal",  webPeer);

            socket.node.sendRequest("signals/client/generate-answer-signal/" + data.id, {
                accepted: true,
                answerSignal: JSON.stringify(signal)
            });

        });

        socket.on("signals/client/join-answer-signal", async (data) => {

            let addressToConnect = data.address;

            let webPeerSignalingClientListObject = SignalingClientList.registerWebPeerSignalingClientListBySignal(data.initiatorSignal, false);
            let webPeer = webPeerSignalingClientListObject.webPeer;

            await webPeer.createSignal(data.answerSignal);

            let timeoutId = setTimeout(() => {
                socket.sendRequest("signals/client/join-answer-signal/" + data.id, {established: false,});
            }, 30000);

            webPeer.peer.once("connect", () => {

                clearTimeout(timeoutId);

                socket.node.sendRequest("signals/client/join-answer-signal/" + data.id, {established: true,});
            })


        });

        this.subscribeClientToSignalingServer(socket, params);
    }

    subscribeClientToSignalingServer(socket, params){

        socket.node.sendRequest("signals/server/register/accept-web-peer-connections", {params: params} );

    }



}

exports.NodeSignalingClientProtocol = new NodeSignalingClientProtocol();

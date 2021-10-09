import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar, Icon, Overlay } from "react-native-elements";
import { material } from "react-native-typography";
import FlatHeader from "../FlatHeader";
import { backgroundStyle } from "../helpers";
import ImageCropPicker from "react-native-image-crop-picker";
import AppRepository from "../../app/Repository";
import QRCode from "react-native-qrcode-svg";

interface SelfProfileViewState {
    avatarUrl: string;
    qrCodeVisible: boolean;
};

// TODO: Profile picture does not update once set. Maybe because the path is the same?
export default class SelfProfileView extends React.Component {
    private navigation: any;
    private jid: string;
    state: SelfProfileViewState;

    constructor(props: any) {
        super(props);
        
        this.navigation = props.navigation;
        this.jid = AppRepository.getInstance().getUserData().getValue().jid;
        
        this.state = {
            avatarUrl: "",
            qrCodeVisible: false
        };

        const avatarCache = AppRepository.getInstance().getAvatarCache();
        avatarCache.hasAvatar(this.jid)
            .then(async (hasAvatar) => {
                if (hasAvatar) {
                    const path = (await avatarCache.getAvatar(AppRepository.getInstance().getXMPPClient(), this.jid)).getValue();
                    this.setState({
                        avatarUrl: `file://${path}`
                    });
                }
            });
        avatarCache.on("avatarSaved", this.onAvatarSet);
    }

    componentWillUnmount = () => {
        AppRepository.getInstance().getAvatarCache().removeListener("avatarSaved", this.onAvatarSet);
    }

    onAvatarSet = ({jid, path}) => {
        if (jid !== this.jid)
            return;
        
        this.setState({
            avatarUrl: `file://${path}`
        });

        // TODO: Actually publish it
    }

    onProfilePictureSelected = (response) => {
        if (response.didCancel)
            return;

        console.log(response.assets[0].uri);
    }

    openCropPicker = () => {
        ImageCropPicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
            includeBase64: true,
            writeTempFile: false,
            cropperCircleOverlay: true
        }).then(async (image) => {
            AppRepository.getInstance().getAvatarCache().setAvatar(image.data, this.jid);
        });
    }

    toggleQrCode = () => {
        this.setState({
            qrCodeVisible: !this.state.qrCodeVisible
        });
    }

    render() {
        const avatarDisplayProps = this.state.avatarUrl ? {source: { uri: this.state.avatarUrl }} : {title: this.jid[0]};
        return (
            <View style={{ height: "100%", ...backgroundStyle(true) }}>
                <View style={{ flexDirection: "row" }}>
                    <FlatHeader navigation={this.navigation} fullWidth={false} />
                    <View style={{ flexDirection: "row", justifyContent: "center", width: "100%", paddingTop: 10 }}>
                        <TouchableOpacity onPress={this.openCropPicker}>
                            <Avatar
                                rounded
                                size="xlarge"
                                title="pa"
                                overlayContainerStyle={{backgroundColor: 'gray'}}
                                {...avatarDisplayProps}>
                                    <Avatar.Accessory name="edit" size={40} />
                            </Avatar>
                        </TouchableOpacity>
                    </View>
                </View>

                <Overlay isVisible={this.state.qrCodeVisible} onBackdropPress={this.toggleQrCode}>
                    <QRCode value={`xmpp:${this.jid}`} size={250} />
                </Overlay>

                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
                    <Text style={material.subheadingWhite}>{this.jid}</Text>
                    <TouchableOpacity onPress={this.toggleQrCode} style={{ marginLeft: 5 }}>
                        <Icon name="qr-code" type="ionicon" color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
};
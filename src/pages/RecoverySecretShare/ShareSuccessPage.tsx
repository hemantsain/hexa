import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    StatusBar,
    Image
} from "react-native";
import Fonts from "../../common/Fonts";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Colors from "../../common/Colors";
import { RFValue } from "react-native-responsive-fontsize";

const ShareSuccessPage = props => {

    useEffect(() => {
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 0 }} />
            <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
            <View style={styles.modalHeaderTitleView}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.navigate("Home");
                        }}
                        style={{ height: 30, width: 30, justifyContent: "center" }}
                    >
                        <FontAwesome
                            name="long-arrow-left"
                            color={Colors.blue}
                            size={17}
                        />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{""}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ ...styles.modalContentContainer, height: '100%' }}>
                    <View style={{ height: '100%' }}>
                        <View style={{ marginTop: hp('3.5%'), marginBottom: hp('2%'), }}>
                            <Text style={styles.commModeModalHeaderText}>{"Secret Sent\nSuccessfully"}</Text>
                            <Text style={styles.commModeModalInfoText}>{"Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do"}</Text>
                        </View>
                        <View style={styles.contactProfileView}>
                            <View style={styles.box}>
                                <View style={{ flexDirection: "row", alignItems: "center", }}>
                                    <Image
                                        style={styles.successModalAmountImage}
                                        source={require("../../assets/images/icons/icon_wallet.png")}
                                    />
                                    <Text style={styles.successModalWalletNameText}>
                                        {"Arpan Jain"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Text style={{ ...styles.commModeModalInfoText, marginBottom: hp('3.5%') }}>{"Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt"}</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity style={{ height: wp("13%"), width: wp("40%"), backgroundColor: Colors.blue, borderRadius: 10, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginLeft: 25 }}><Text style={{ color: Colors.white, fontFamily: Fonts.FiraSansMedium, fontSize: RFValue(13) }}>Go to Wallet</Text></TouchableOpacity>
                <Image source={require("../../assets/images/icons/accept.png")} style={{ height: wp("40%"), width: wp("35%"), marginLeft: 'auto' }} />
            </View>
        </View>
    );
};

export default ShareSuccessPage;

const styles = StyleSheet.create({
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18),
        fontFamily: Fonts.FiraSansRegular
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: "center",
        flexDirection: "row",
        paddingRight: 10,
        paddingBottom: hp("1.5%"),
        paddingTop: hp("1%"),
        marginLeft: 10,
        marginRight: 10,
        marginBottom: hp("1.5%")
    },
    modalContentContainer: {
        height: '100%',
        backgroundColor: Colors.white,
    },
    commModeModalHeaderText: {
        color: Colors.blue,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(18),
        marginLeft: 25,
        marginRight: 25
    },
    commModeModalInfoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
        marginLeft: 25,
        marginRight: 25,
    },
    contactProfileView: {
        flexDirection: 'row',
        marginLeft: 25,
        marginRight: 25,
        alignItems: 'center',
        justifyContent: "space-between",
        marginBottom: hp('3.5%'),
        marginTop: hp('1.7%')
    },
    successModalWalletNameText: {
        color: Colors.black,
        fontSize: RFValue(25),
        fontFamily: Fonts.FiraSansRegular,
        flex: 1
    },
    successModalAmountImage: {
        width: wp("15%"),
        height: wp("15%"),
        marginRight: 10,
        marginLeft: 10,
        resizeMode: "contain"
    },
    box: {
        justifyContent: 'center',
        backgroundColor: Colors.backgroundColor1,
        borderRadius: 10,
        width: '100%',
        height: hp('15%')
    },
})
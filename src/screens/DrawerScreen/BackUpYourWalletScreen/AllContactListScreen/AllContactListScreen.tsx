import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Dimensions } from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text,
    Icon,
    List,
    ListItem,
    Thumbnail,
    Card,
    CardItem
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import GridView from 'react-native-super-grid';


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";




//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );

export default class AllContactListScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_ContactList: [],
            SelectedFakeContactList: [],
            flag_NextBtnDisable: true,
            flag_Loading: false,
            flag_MaxItemSeletedof3: true
        } )
    }
    componentWillMount = () => {
        Contacts.getAll( ( err, contacts ) => {
            if ( err ) {
                throw err;
            }
            //console.log( { contacts } );
            this.setState( {
                data: contacts,
                arr_ContactList: contacts
            } )
        } )
    }
    press = ( hey ) => {
        this.state.data.map( ( item, index ) => {
            if ( item.recordID === hey.recordID ) {
                //if ( this.state.SelectedFakeContactList.length <= 2 ) {
                item.check = !item.check
                if ( item.check === true ) {
                    this.state.SelectedFakeContactList.push( item );
                    //  console.log( 'selected:' + item.givenName );
                } else if ( item.check === false ) {
                    const i = this.state.SelectedFakeContactList.indexOf( item )
                    if ( 1 != -1 ) {
                        this.state.SelectedFakeContactList.splice( i, 1 )
                        //  console.log( 'unselect:' + item.givenName )
                        return this.state.SelectedFakeContactList
                    }
                }
            }
        } )
        let seletedLength = this.state.SelectedFakeContactList.length;
        // console.log( { seletedLength } );
        this.setState( { data: this.state.data } )
        if ( seletedLength == 3 ) {
            this.setState( {
                flag_NextBtnDisable: false
            } )
        } else {
            this.setState( {
                flag_NextBtnDisable: true
            } )
        }
    }
    //TODO: Searching Contact List
    searchFilterFunction = ( text: string ) => {
        if ( text.length > 0 ) {
            const newData = this.state.data.filter( item => {
                const itemData = `${ item.givenName != null && item.givenName.toUpperCase() }   
    ${ item.familyName != null && item.familyName.toUpperCase() }`;
                const textData = text.toUpperCase();
                return itemData.indexOf( textData ) > -1;
            } );

            this.setState( { data: newData } );
        } else {
            this.setState( {
                data: this.state.arr_ContactList
            } )
        }
    };

    //TODO: func click_Next
    click_Next = async () => {
        let selectedContactList = this.state.SelectedFakeContactList;
        console.log( { selectedContactList } );
        const resUpdateSSSContactDetails = await dbOpration.updateSSSContactListDetails(
            localDB.tableName.tblSSSDetails,
            selectedContactList,
        );
        if ( resUpdateSSSContactDetails ) {
            this.props.navigation.push( "SecretSharingScreen" );
        }
    }

    //TODO: Remove gird on click item
    click_RemoveGridItem( item: any ) {
        // console.log( { item } );
        let arr_SelectedItem = this.state.SelectedFakeContactList;
        let arr_FullArrayList = this.state.data;
        for ( var i = 0; i < arr_SelectedItem.length; i++ ) {
            if ( arr_SelectedItem[ i ].recordID === item.recordID ) {
                arr_SelectedItem.splice( i, 1 );
                // console.log( arr_FullArrayList[ i ] );
                break;
            }
        }
        for ( var i = 0; i < arr_FullArrayList.length; i++ ) {
            if ( arr_FullArrayList[ i ].recordID === item.recordID ) {
                let data = arr_FullArrayList[ i ];
                data.check = false;
                arr_FullArrayList[ i ] = data;
                break;
            }
        }
        this.setState( {
            SelectedFakeContactList: arr_SelectedItem,
            data: arr_FullArrayList
        } )
        let seletedLength = this.state.SelectedFakeContactList.length;
        if ( seletedLength == 3 ) {
            this.setState( {
                flag_NextBtnDisable: false
            } )
        } else {
            this.setState( {
                flag_NextBtnDisable: true
            } )
        }
    }

    render() {
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Contacts</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                        >
                            <View style={ { flex: 0.2 } }>
                                <View style={ { marginLeft: 10, marginRight: 10, backgroundColor: "#EDEDED", borderRadius: 10 } }>
                                    <Item style={ { borderColor: 'transparent', marginLeft: 10 } }>
                                        <Icon name="ios-search" color="#B7B7B7" />
                                        <Input placeholder="Enter a name to begin search"
                                            style={ [ globalStyle.ffFiraSansMedium ] }
                                            placeholderTextColor="#B7B7B7"
                                            onChangeText={ text => this.searchFilterFunction( text ) }
                                            autoCorrect={ false } />
                                    </Item>
                                </View>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, marginRight: 10, marginBottom: 20 } ] }>Select three of your trusted contacts, make sure you can always reach this people to recover your wallet</Text>
                            </View>
                            <View style={ { flex: 1 } }>
                                <GridView
                                    style={ styles.gridSelectedList }
                                    items={ this.state.SelectedFakeContactList }
                                    renderItem={ ( item, index ) => (
                                        <View style={ { alignItems: "center", justifyContent: "center", } }>
                                            <View style={ { flexDirection: "row" } }>
                                                { renderIf( item.thumbnailPath != "" )(
                                                    <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                ) }
                                                { renderIf( item.thumbnailPath == "" )(
                                                    <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                ) }
                                                <View style={ { alignItems: "flex-end", justifyContent: "flex-end", marginLeft: -14 } }>
                                                    <TouchableOpacity onPress={ () => this.click_RemoveGridItem( item ) }>
                                                        <SvgIcon name="close-circle" color="gray" size={ 20 } style={ { borderColor: "#F8F8F8", borderWidth: 2, borderRadius: 12 } } />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <Text>{ item.givenName }{ " " }{ item.familyName }</Text>
                                        </View>
                                    ) }
                                    itemDimension={ Dimensions.get( 'screen' ).width / 4.0 }
                                    itemsPerRow={ 3 }
                                />
                                <FlatList
                                    data={
                                        this.state.data
                                    }
                                    showsVerticalScrollIndicator={ false }
                                    renderItem={ ( { item } ) => (
                                        <TouchableOpacity style={ {
                                        } } onPress={ () => {
                                            this.press( item )
                                        } }>
                                            <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                    { renderIf( item.thumbnailPath != "" )(
                                                        <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                    ) }
                                                    { renderIf( item.thumbnailPath == "" )(
                                                        <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                    ) }
                                                    <Text style={ [ globalStyle.ffFiraSansRegular, { alignSelf: "center", marginLeft: 10 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>

                                                    <View style={ {
                                                        flex: 1,
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center'
                                                    } }>
                                                        { item.check
                                                            ? (
                                                                <IconFontAwe name="checkbox-marked" size={ 30 } color={ primaryColor } />
                                                            )
                                                            : (
                                                                <IconFontAwe name="checkbox-blank-outline" size={ 30 } color={ darkGrey } />
                                                            ) }
                                                    </View>
                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    ) }
                                    keyExtractor={ item => item.recordID }
                                    extraData={ this.state }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                        { renderIf( this.state.flag_NextBtnDisable == false )(
                            <View style={ styles.btnNext }>
                                <FullLinearGradientButton title="Next" disabled={ this.state.flag_NextBtnDisable } style={ [ this.state.flag_NextBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10, marginLeft: 30, marginRight: 30 } ] } click_Done={ () => this.click_Next() } />
                            </View>
                        ) }
                    </ImageBackground>
                </SafeAreaView>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message="Loading" />
            </Container >
        );
    }
}

const primaryColor = colors.appColor;
const darkGrey = "#bdc3c7";
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: "center",
        margin: 10
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    },
    btnNext: {
        position: "absolute",
        bottom: 10,
        width: "100%"

    },
    //Grid View Selected
    gridSelectedList: {
        flex: 1
    }
} );
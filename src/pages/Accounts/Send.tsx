import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  Keyboard,
  AsyncStorage,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from 'react-native-slider';
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST1,
  clearTransfer,
  transferST2,
  fetchTransactions,
  transferST3,
  fetchBalance,
  fetchBalanceTx,
  alternateTransferST2,
} from '../../store/actions/accounts';
import DeviceInfo from 'react-native-device-info';
import SendStatusModalContents from '../../components/SendStatusModalContents';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import BottomSheet from 'reanimated-bottom-sheet';
import CustodianRequestOtpModalContents from '../../components/CustodianRequestOtpModalContents';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import QrCodeModalContents from '../../components/QrCodeModalContents';
// import HealthCheckGoogleAuthModalContents from '../../components/HealthCheckGoogleAuthModalContents';
import BottomInfoBox from '../../components/BottomInfoBox';
import SendConfirmationContent from './SendConfirmationContent';
import ModalHeader from '../../components/ModalHeader';
import LostTwoFA from './LostTwoFA';
import ResetTwoFAHelp from './ResetTwoFAHelp';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import ErrorModalContents from '../../components/ErrorModalContents';
import ResetTwoFASuccess from './ResetTwoFASuccess';
import NewTwoFASecret from './NewTwoFASecret';
import ServerErrorModal from './ServerErrorModal';
import TwoFASweepFunds from './TwoFASweepFunds';

export default function Send(props) {
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [
    SendConfirmationBottomSheet,
    setSendConfirmationBottomSheet,
  ] = useState(React.createRef());
  const [
    SendSuccessWithAddressBottomSheet,
    setSuccessWithAddressBottomSheet,
  ] = useState(React.createRef());
  const [
    SendUnSuccessWithAddressBottomSheet,
    setUnSuccessWithAddressBottomSheet,
  ] = useState(React.createRef());

  // const [
  //   SendConfirmationWithContactBottomSheet,
  //   setSendConfirmationWithContactBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   SendSuccessWithContactBottomSheet,
  //   setSuccessWithContactBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   SendUnSuccessWithContactBottomSheet,
  //   setUnSuccessWithContactBottomSheet,
  // ] = useState(React.createRef());

  const [averageTxFees, setAverageTxFees] = useState(
    props.navigation.getParam('averageTxFees'),
  );
  const [serviceType, setServiceType] = useState(
    props.navigation.getParam('serviceType')
      ? props.navigation.getParam('serviceType')
      : REGULAR_ACCOUNT,
  );
  const sweepSecure = props.navigation.getParam('sweepSecure');
  let netBalance = props.navigation.getParam('netBalance');
  const { transfer, loading, service } = useSelector(
    (state) => state.accounts[serviceType],
  );
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const getServiceType = props.navigation.getParam('getServiceType')
    ? props.navigation.getParam('getServiceType')
    : null;
  const isFromAddressBook = props.navigation.getParam('isFromAddressBook') ? props.navigation.getParam('isFromAddressBook') : false;
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [description, setDescription] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [isSendHelperDone, setIsSendHelperDone] = useState(true);
  const [isInvalidBalance, setIsInvalidBalance] = useState(false);
  const [isInvalidAddress, setIsInvalidAddress] = useState(true);
  // const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [SendHelperBottomSheet, setSendHelperBottomSheet] = useState(
    React.createRef(),
  );

  const [isEditable, setIsEditable] = useState(true);
  function onPressNumber(text) {
    let tmpToken = token;
    if (token.length < 6) {
      tmpToken += text;
      setToken(tmpToken);
    }
  }

  const [dropdownBoxList, setDropdownBoxList] = useState([
    {
      id: '1',
      account_name: 'Test Account',
      type: TEST_ACCOUNT,
    },
    {
      id: '2',
      account_name: 'Checking Account',
      type: REGULAR_ACCOUNT,
    },
    {
      id: '3',
      account_name: 'Saving Account',
      type: SECURE_ACCOUNT,
    },
  ]);

  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  let userInfo = {
    to: '2MvXh39FM7m5v8GHyQ3eCLi45ccA1pFL7DR',
    from: 'Secure Account',
    amount: '0.00012',
    fee: '0.0001',
    total: 0.00022,
    estDeliveryTime: '2 hours',
    description: '',
  };

  const checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isSendHelperDone', 'true');
      setTimeout(() => {
        setIsSendHelperDone(true);
      }, 10);

      setTimeout(() => {
        if (SendHelperBottomSheet.current)
          SendHelperBottomSheet.current.snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSendHelperDone(false);
      }, 10);
    }
  };
  const [openmodal, setOpenmodal] = useState('closed');
  const viewRef = useRef(null);
  const tapSliderHandler = (evt) => {
    if (viewRef.current) {
      viewRef.current.measure((fx, fy, width, height, px) => {
        const location = (evt.nativeEvent.locationX - px) / width;
        if (location >= -0.1 && location <= 0.2) {
          setSliderValue(0);
        } else if (location >= 0.3 && location <= 0.6) {
          setSliderValue(5);
        } else if (location >= 0.7 && location <= 1) {
          setSliderValue(10);
        }
      });
    }
  };

  useEffect(() => {
    checkNShowHelperModal();
  }, []);

  useEffect(() => {
    if (!averageTxFees) {
      (async () => {
        const storedAverageTxFees = await AsyncStorage.getItem(
          'storedAverageTxFees',
        );
        if (storedAverageTxFees) {
          const { averageTxFees, lastFetched } = JSON.parse(
            storedAverageTxFees,
          );
          if (Date.now() - lastFetched < 1800000) {
            setAverageTxFees(averageTxFees);
            return;
          } // maintaining a half an hour difference b/w fetches
        }

        const instance = service.hdWallet || service.secureHDWallet;
        const averageTxFees = await instance.averageTransactionFee();
        setAverageTxFees(averageTxFees);
        await AsyncStorage.setItem(
          'storedAverageTxFees',
          JSON.stringify({ averageTxFees, lastFetched: Date.now() }),
        );
      })();
    }
  }, []);

  useEffect(() => {
    if (sweepSecure) {
      SendConfirmationBottomSheet.current.snapTo(0);
      if (netBalance === 0) {
        setAmount(`0`);
      } else {
        setAmount(
          `${
            netBalance -
            Number(
              averageTxFees[
                sliderValueText === 'Low Fee'
                  ? 'low'
                  : sliderValueText === 'In the middle'
                  ? 'medium'
                  : 'high'
              ].averageTxFee,
            )
          }`,
        );
      }
    }
  }, [sweepSecure, sliderValueText]);

  // const stage2 = () => (
  //   <View style={{ margin: 40 }}>
  //     <Text style={{ marginVertical: 5 }}>Sending to: {recipientAddress}</Text>
  //     <Text style={{ marginVertical: 5 }}>Amount: {amount}</Text>
  //     <Text style={{ marginVertical: 10 }}>
  //       Transaction Fee: {transfer.stage1.fee}
  //     </Text>
  //     {loading.transfer ? (
  //       <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
  //     ) : (
  //       <View>
  //         <Button
  //           title="Send"
  //           onPress={() => {
  //             dispatch(transferST2(serviceType));
  //           }}
  //         />
  //         <Button
  //           title="Cancel"
  //           onPress={() => {
  //             dispatch(clearTransfer(serviceType));
  //           }}
  //         />
  //       </View>
  //     )}
  //   </View>
  // );

  // const renderSuccessStatusContents = () => (
  //   <SendStatusModalContents
  //     title1stLine={'Sent Successfully'}
  //     title2ndLine={''}
  //     info1stLine={'Bitcoins successfully sent to'}
  //     info2ndLine={''}
  //     userName={recipientAddress}
  //     modalRef={SendSuccessBottomSheet}
  //     isSuccess={true}
  //     onPressViewAccount={() => {
  //       dispatch(clearTransfer(serviceType));
  //       dispatch(fetchTransactions(serviceType));
  //       props.navigation.navigate('Accounts');
  //     }}
  //     transactionId={transfer.txid}
  //     transactionDateTime={Date()}
  //   />
  // );

  const updateDescription = useCallback(async (txid, description) => {
    let descriptionHistory = {};
    const storedHistory = JSON.parse(
      await AsyncStorage.getItem('descriptionHistory'),
    );
    if (storedHistory) descriptionHistory = storedHistory;
    descriptionHistory[txid] = description;

    await AsyncStorage.setItem(
      'descriptionHistory',
      JSON.stringify(descriptionHistory),
    );
  }, []);

  const dispatch = useDispatch();

  const renderSuccessStatusContents = () => (
    <SendStatusModalContents
      title1stLine={'Sent Successfully'}
      title2ndLine={''}
      info1stLine={'Bitcoins successfully sent to'}
      info2ndLine={''}
      userName={recipientAddress}
      // modalRef={SendSuccessBottomSheet}
      isSuccess={true}
      onPressViewAccount={() => {
        dispatch(clearTransfer(serviceType));
        // dispatch(fetchTransactions(serviceType));
        dispatch(
          fetchBalanceTx(serviceType, {
            loader: true,
          }),
        );
        props.navigation.navigate('Accounts');
      }}
      transactionId={transfer.txid}
      transactionDateTime={Date()}
    />
  );

  useEffect(() => {
    if (
      transfer.stage1.failed ||
      transfer.stage2.failed ||
      transfer.stage3.failed
    ) {
      if (SendConfirmationBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendConfirmationBottomSheet.current.snapTo(0);
      }
      if (SendUnSuccessWithAddressBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendUnSuccessWithAddressBottomSheet.current.snapTo(1);
      }
      setIsEditable(true);
    } else if (transfer.txid) {
      if (description) {
        updateDescription(transfer.txid, description);
      }
      if (SendConfirmationBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendConfirmationBottomSheet.current.snapTo(0);
      }
      if (SendSuccessWithAddressBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendSuccessWithAddressBottomSheet.current.snapTo(1);
      }
    } else if (transfer.executed === 'ST1') {
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(1);
      setTimeout(() => {
        setIsConfirmDisabled(false);
      }, 10);
    } else if (!transfer.txid && transfer.executed === 'ST2') {
      setIsConfirmDisabled(false);
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(0);
      props.navigation.navigate('TwoFAToken', {
        serviceType,
        recipientAddress,
      });
    }
  }, [transfer]);

  const renderSendHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={`Sending Bitcoins`}
        image={require('../../assets/images/icons/send.png')}
        helperInfo={`When you want to send bitcoins or sats, you need the recipient’s bitcoin address\n\nYou can scan this address as a QR code or copy it from the recipient`}
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          if (SendHelperBottomSheet.current)
            (SendHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSendHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (isSendHelperDone) {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsSendHelperDone(false);
            }, 10);
          } else {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const getQrCodeData = (qrData) => {
    setTimeout(() => {
      setQrBottomSheetsFlag(false);
      setRecipientAddress(qrData);
    }, 2);
    setTimeout(() => {
      if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
    }, 10);
  };

  const renderContent1 = () => {
    return (
      <QrCodeModalContents
        flag={true}
        modalRef={bottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => getQrCodeData(qrData)}
      />
    );
  };

  function renderHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => {
          setTimeout(() => {
            setQrBottomSheetsFlag(false);
          }, 2);
          if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
        }}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>QR</Text>
      </TouchableOpacity>
    );
  }

  // const renderHealthCheckGoogleAuthContents = useCallback(() => {
  //   return (
  //     <HealthCheckGoogleAuthModalContents
  //       modalRef={HealthCheckGoogleAuthBottomSheet}
  //       onPressConfirm={() => {
  //         Keyboard.dismiss();
  //         (HealthCheckGoogleAuthBottomSheet as any).current.snapTo(0);
  //         //  (HealthCheckSuccessBottomSheet as any).current.snapTo(1);
  //       }}
  //     />
  //   );
  // }, []);

  // const renderHealthCheckGoogleAuthHeader = useCallback(() => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         (HealthCheckGoogleAuthBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

  const renderSendConfirmationContents = () => {
    if (transfer) {
      userInfo = {
        to: recipientAddress,
        from: getAccountFromType(),
        amount: amount,
        fee: transfer.stage1.fee,
        total: parseInt(amount, 10) + parseInt(transfer.stage1.fee, 10),
        estDeliveryTime: timeConvert(transfer.stage1.estimatedBlocks * 10),
        description: description,
      };
    }
    return (
      <SendConfirmationContent
        title={'Send Confirmation'}
        info={'Confirm the follow details'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          if (sweepSecure) {
            dispatch(alternateTransferST2(serviceType));
          } else {
            dispatch(transferST2(serviceType));
          }
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendConfirmationBottomSheet.current)
            SendConfirmationBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderSendConfirmationHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (SendConfirmationBottomSheet.current) {
            dispatch(clearTransfer(serviceType));
            SendConfirmationBottomSheet.current.snapTo(0);
          }
        }}
      />
    );
  };

  const renderSendSuccessWithAddressContents = () => {
    if (transfer) {
      userInfo = {
        to: recipientAddress,
        from: getAccountFromType(),
        amount: amount,
        fee: transfer.stage1.fee,
        total: parseInt(amount, 10) + parseInt(transfer.stage1.fee, 10),
        estDeliveryTime: timeConvert(transfer.stage1.estimatedBlocks * 10),
        description: description,
      };
    }
    return (
      <SendConfirmationContent
        title={'Sent Successfully'}
        info={'Bitcoins successfully sent to Contact'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          dispatch(clearTransfer(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
            }),
          );
          if (SendSuccessWithAddressBottomSheet.current)
            SendSuccessWithAddressBottomSheet.current.snapTo(0);
          props.navigation.replace('Accounts', {serviceType: serviceType});
        }}
        isSuccess={true}
      />
    );
  };

  const renderSendSuccessWithAddressHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          dispatch(clearTransfer(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
            }),
          );
          if (SendSuccessWithAddressBottomSheet.current)
            SendSuccessWithAddressBottomSheet.current.snapTo(0);
          props.navigation.navigate('Accounts');
        }}
      />
    );
  };

  const renderSendUnSuccessWithAddressContents = () => {
    return (
      <SendConfirmationContent
        title={'Sent Unsuccessful'}
        info={'There seems to be a problem'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
          checkBalance();
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        isUnSuccess={true}
      />
    );
  };

  const renderSendUnSuccessWithAddressHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  useEffect(() => {
    if (serviceType === SECURE_ACCOUNT) {
      (async () => {
        if (
          !(await AsyncStorage.getItem('twoFASetup')) &&
          !(await AsyncStorage.getItem('walletRecovered'))
        ) {
          props.navigation.navigate('TwoFASetup', {
            twoFASetup: service.secureHDWallet.twoFASetup,
          });
          await AsyncStorage.setItem('twoFASetup', 'true');
        }
      })();
    }
  }, []);

  const getAccountFromType = () => {
    if (serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    }
    if (serviceType == 'SECURE_ACCOUNT') {
      return 'Secure Account';
    }
    if (serviceType == 'REGULAR_ACCOUNT') {
      return 'Checking Account';
    }
    if (serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  function timeConvert(valueInMinutes) {
    var num = valueInMinutes;
    var hours = Math.round(num / 60);
    var days = Math.round(hours / 24);
    if (valueInMinutes < 60) {
      return valueInMinutes + ' minutes';
    } else if (hours < 24) {
      return hours + ' hours';
    } else if (days > 0) {
      return days == 1 ? days + ' day' : days + ' days';
    }
  }

  const checkBalance = () => {
    setIsConfirmDisabled(true);
    if (
      netBalance <
      Number(amount) +
        Number(
          averageTxFees[
            sliderValueText === 'Low Fee'
              ? 'low'
              : sliderValueText === 'In the middle'
              ? 'medium'
              : 'high'
          ].averageTxFee,
        )
    ) {
      setIsInvalidBalance(true);
    } else {
      setIsEditable(false);
      const priority =
        sliderValueText === 'Low Fee'
          ? 'low'
          : sliderValueText === 'In the middle'
          ? 'medium'
          : 'high';
      dispatch(
        transferST1(serviceType, {
          recipientAddress,
          amount: parseInt(amount),
          priority,
          averageTxFees,
        }),
      );
    }
  };

  useEffect(() => {
    console.log(
      'isInvalidAddress && recipientAddress && amount',
      isInvalidAddress,
      recipientAddress,
      amount,
    );
    if (isInvalidAddress && recipientAddress && amount) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [recipientAddress, isInvalidAddress, amount]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView>
            <TouchableWithoutFeedback
              onPress={() => {
                if (SendHelperBottomSheet.current)
                  SendHelperBottomSheet.current.snapTo(0);
              }}
            >
              <View onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeaderTitleView}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (getServiceType) {
                          getServiceType(serviceType);
                        }
                        props.navigation.goBack();
                      }}
                      style={{
                        height: 30,
                        width: 30,
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome
                        name="long-arrow-left"
                        color={Colors.blue}
                        size={17}
                      />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
                    {serviceType == TEST_ACCOUNT ? (
                      <Text
                        onPress={() => {
                          AsyncStorage.setItem('isSendHelperDone', 'true');
                          if (SendHelperBottomSheet.current)
                            SendHelperBottomSheet.current.snapTo(1);
                        }}
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(12),
                          marginLeft: 'auto',
                        }}
                      >
                        Know more
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                  <View style={styles.textBoxView}>
                    <TextInput
                      editable={isEditable}
                      style={styles.textBox}
                      placeholder={'Address'}
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      value={recipientAddress}
                      onChangeText={setRecipientAddress}
                      placeholderTextColor={Colors.borderColor}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            setIsInvalidAddress(true);
                          }, 10);
                        }
                      }}
                      onBlur={() => {
                        const instance =
                          service.hdWallet || service.secureHDWallet;
                        let isAddressValid = instance.isValidAddress(
                          recipientAddress,
                        );
                        setIsInvalidAddress(isAddressValid);
                      }}
                    />
                    {isFromAddressBook ? 
                    <TouchableOpacity
                      style={styles.contactNameInputImageView}
                      onPress={() => {
                        props.navigation.navigate('AddressBookContents');
                      }}
                    >
                      <Image
                        style={styles.textBoxImage}
                        source={require('../../assets/images/icons/icon_phonebook.png')}
                      />
                    </TouchableOpacity> : 
                    <TouchableOpacity
                      style={styles.contactNameInputImageView}
                      onPress={() => {
                        if (bottomSheet.current)
                          (bottomSheet as any).current.snapTo(1);
                        // props.navigation.navigate('QrScanner', {
                        //   scanedCode: getQrCodeData,
                        // });
                      }}
                    >
                      <Image
                        style={styles.textBoxImage}
                        source={require('../../assets/images/icons/qr-code.png')}
                      />
                    </TouchableOpacity>
                    }
                  </View>
                  {!isInvalidAddress ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>
                        Enter correct address
                      </Text>
                    </View>
                  ) : null}
                  {serviceType == TEST_ACCOUNT ? (
                    <Text
                      onPress={() => {
                        setRecipientAddress(
                          '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8',
                        );
                      }}
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                        marginLeft: 'auto',
                        fontFamily: Fonts.FiraSansItalic,
                      }}
                    >
                      Send it to a sample address
                    </Text>
                  ) : null}
                  {isFromAddressBook ? 
                  <TouchableOpacity
                    activeOpacity={10}
                    style={[
                      dropdownBoxOpenClose
                        ? styles.dropdownBoxOpened
                        : styles.dropdownBox,
                    ]}
                    onPress={() => {
                      setDropdownBoxOpenClose(!dropdownBoxOpenClose);
                    }}
                  >
                    <Text
                      style={{
                        ...styles.dropdownBoxText,
                        color: Colors.textColorGrey,
                      }}
                    >
                      {serviceType == TEST_ACCOUNT
                        ? 'Test Account'
                        : serviceType == REGULAR_ACCOUNT
                        ? 'Checking Account'
                        : 'Saving Account'}
                    </Text>
                    <Ionicons
                      style={{ marginLeft: 'auto' }}
                      name={
                        dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'
                      }
                      size={15}
                      color={Colors.borderColor}
                    />
                  </TouchableOpacity> : null
}
                  <View style={{ position: 'relative' }}>
                    {dropdownBoxOpenClose && (
                      <View style={styles.dropdownBoxModal}>
                        <ScrollView>
                          {dropdownBoxList.map((value, index) => (
                            <TouchableOpacity
                              onPress={() => {
                                setServiceType(value.type);

                                setDropdownBoxOpenClose(false);
                              }}
                              style={{
                                ...styles.dropdownBoxModalElementView,
                                backgroundColor:
                                  serviceType == value.type
                                    ? Colors.lightBlue
                                    : Colors.white,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    serviceType == value.type
                                      ? Colors.blue
                                      : Colors.black,
                                  fontFamily: Fonts.FiraSansRegular,
                                  fontSize: RFValue(12),
                                }}
                              >
                                {value.account_name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    <View style={styles.textBoxView}>
                      <View style={styles.amountInputImage}>
                        <Image
                          style={styles.textBoxImage}
                          source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                        />
                      </View>
                      <TextInput
                        editable={sweepSecure ? false : isEditable}
                        style={{ ...styles.textBox, paddingLeft: 10 }}
                        placeholder={
                          serviceType === TEST_ACCOUNT
                            ? 'Enter Amount in t-sats'
                            : 'Enter Amount in sats'
                        }
                        value={amount}
                        returnKeyLabel="Done"
                        returnKeyType="done"
                        keyboardType={'numeric'}
                        onChangeText={(value) => setAmount(value)}
                        placeholderTextColor={Colors.borderColor}
                        onKeyPress={(e) => {
                          if (e.nativeEvent.key === 'Backspace') {
                            setTimeout(() => {
                              setIsInvalidBalance(false);
                            }, 10);
                          }
                        }}
                      />
                    </View>
                    {isInvalidBalance ? (
                      <View style={{ marginLeft: 'auto' }}>
                        <Text style={styles.errorText}>
                          Insufficient balance
                        </Text>
                      </View>
                    ) : null}
                    <View style={{ ...styles.textBoxView }}>
                      <TextInput
                        editable={isEditable}
                        style={styles.textBox}
                        returnKeyLabel="Done"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        keyboardType={
                          Platform.OS == 'ios'
                            ? 'ascii-capable'
                            : 'visible-password'
                        }
                        placeholder={'Description (Optional)'}
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor={Colors.borderColor}
                      />
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: Colors.borderColor,
                    marginRight: 10,
                    marginLeft: 10,
                    marginTop: hp('3%'),
                    marginBottom: hp('3%'),
                  }}
                />

                <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                  <Text
                    style={{
                      color: Colors.blue,
                      fontSize: RFValue(13),
                      fontFamily: Fonts.FiraSansRegular,
                    }}
                  >
                    Transaction Priority
                  </Text>
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(12),
                      fontFamily: Fonts.FiraSansRegular,
                    }}
                  >
                    Set priority for your transaction
                  </Text>

                  <View
                    style={{
                      ...styles.textBoxView,
                      flexDirection: 'column',
                      height: 'auto',
                      marginTop: hp('2%'),
                      alignItems: 'center',
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row' }}
                      ref={viewRef}
                      collapsable={false}
                    >
                      <TouchableWithoutFeedback onPressIn={tapSliderHandler}>
                        <Slider
                          style={{ flex: 1 }}
                          minimumValue={0}
                          maximumValue={10}
                          step={5}
                          minimumTrackTintColor={Colors.blue}
                          maximumTrackTintColor={Colors.borderColor}
                          thumbStyle={{
                            borderWidth: 5,
                            borderColor: Colors.white,
                            backgroundColor: Colors.blue,
                            height: 30,
                            width: 30,
                            borderRadius: 15,
                          }}
                          trackStyle={{ height: 8, borderRadius: 10 }}
                          thumbTouchSize={{
                            width: 30,
                            height: 30,
                            backgroundColor: 'blue',
                          }}
                          value={sliderValue}
                          onValueChange={(value) => {
                            setSliderValue(value);
                          }}
                          onSlidingComplete={(value) => {
                            value == 0
                              ? setSliderValueText('Low Fee')
                              : value == 5
                              ? setSliderValueText('In the middle')
                              : setSliderValueText('Fast Transaction');
                          }}
                        />
                      </TouchableWithoutFeedback>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                          textAlign: 'center',
                          flex: 1,
                          flexWrap: 'wrap',
                          marginRight: 5,
                        }}
                      >
                        {'Low Fee\n'} (
                        {averageTxFees ? averageTxFees['low'].averageTxFee : ''}
                        {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'})
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                          textAlign: 'center',
                          flex: 1,
                          flexWrap: 'wrap',
                          marginRight: 5,
                        }}
                      >
                        {'In the middle\n'} (
                        {averageTxFees
                          ? averageTxFees['medium'].averageTxFee
                          : ''}
                        {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'})
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                          textAlign: 'center',
                          flex: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        {'Fast Transaction\n'} (
                        {averageTxFees
                          ? averageTxFees['high'].averageTxFee
                          : ''}
                        {serviceType === TEST_ACCOUNT ? ' t-sats' : ' sats'})
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    flexDirection: 'row',
                    marginTop: hp('5%'),
                    marginBottom: hp('5%'),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      checkBalance();
                    }}
                    disabled={isConfirmDisabled}
                    style={{
                      ...styles.confirmButtonView,
                      backgroundColor: Colors.blue,
                      elevation: 10,
                      shadowColor: Colors.shadowBlue,
                      shadowOpacity: 1,
                      shadowOffset: { width: 15, height: 15 },
                      opacity: isConfirmDisabled ? 0.5 : 1,
                    }}
                  >
                    {loading.transfer && !isInvalidBalance ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Confirm</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      ...styles.confirmButtonView,
                      width: wp('30%'),
                    }}
                    onPress={() => {
                      dispatch(clearTransfer(serviceType));
                      if (getServiceType) {
                        getServiceType(serviceType);
                      }
                      props.navigation.goBack();
                    }}
                  >
                    <Text style={{ ...styles.buttonText, color: Colors.blue }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* {transfer.executed === 'ST1' ? stage2() : null} */}
                <View
                  style={{
                    marginBottom: hp('5%'),
                  }}
                >
                  <BottomInfoBox
                    title={'Note'}
                    infoText={
                      'When you want to send bitcoins, you need the address of the receiver. For this you can either scan a QR code from their wallet/ app or copy address into the address field'
                    }
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendHelperBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSendHelperContents}
        renderHeader={renderSendHelperHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag(true);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={bottomSheet}
        snapPoints={[0, hp('90%')]}
        renderContent={renderContent1}
        renderHeader={renderHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendConfirmationBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendConfirmationContents}
        renderHeader={renderSendConfirmationHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          {
            dispatch(clearTransfer(serviceType));
            dispatch(
              fetchBalanceTx(serviceType, {
                loader: true,
              }),
            );
            props.navigation.navigate('Accounts');
          }
        }}
        enabledInnerScrolling={true}
        ref={SendSuccessWithAddressBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendSuccessWithAddressContents}
        renderHeader={renderSendSuccessWithAddressHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          dispatch(clearTransfer(serviceType));
          SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={SendUnSuccessWithAddressBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendUnSuccessWithAddressContents}
        renderHeader={renderSendUnSuccessWithAddressHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
  },
  modalHeaderContainer: {
    backgroundColor: Colors.white,
    marginTop: 'auto',
    flex: 1,
    height: Platform.OS == 'ios' ? 45 : 40,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  contactNameInputImageView: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  confirmButtonView: {
    width: wp('50%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue(13),
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp('12%'),
    width: wp('12%'),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp('12%'),
    width: wp('12%'),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  otpRequestHeaderView: {
    marginTop: hp('4%'),
    marginBottom: hp('2%'),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  confirmModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
  },
  dropdownBox: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  dropdownBoxOpened: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  dropdownBoxText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp('1%'),
    width: wp('90%'),
    height: hp('18%'),
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.white,
    position: 'absolute',
    zIndex: 9999,
    overflow: 'hidden',
  },
  dropdownBoxModalElementView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
  },
});

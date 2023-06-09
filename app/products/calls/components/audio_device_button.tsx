// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {Pressable, type StyleProp, Text, type TextStyle, View, type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {setPreferredAudioRoute} from '@calls/actions/calls';
import {AudioDevice, type CurrentCall} from '@calls/types/calls';
import CompassIcon from '@components/compass_icon';
import SlideUpPanelItem, {ITEM_HEIGHT} from '@components/slide_up_panel_item';
import {Device} from '@constants';
import {useTheme} from '@context/theme';
import {bottomSheet, dismissBottomSheet} from '@screens/navigation';
import {bottomSheetSnapPoint} from '@utils/helpers';
import {typography} from '@utils/typography';

type Props = {
    pressableStyle: StyleProp<ViewStyle>;
    iconStyle: StyleProp<ViewStyle>;
    buttonTextStyle: StyleProp<TextStyle>;
    currentCall: CurrentCall;
}

const style = {
    bold: typography('Body', 200, 'SemiBold'),
};

export const AudioDeviceButton = ({pressableStyle, iconStyle, buttonTextStyle, currentCall}: Props) => {
    const intl = useIntl();
    const theme = useTheme();
    const {bottom} = useSafeAreaInsets();
    const isTablet = Device.IS_TABLET; // not `useIsTablet` because even if we're in splitView, we're still using a tablet.
    const color = theme.awayIndicator;
    const audioDeviceInfo = currentCall.audioDeviceInfo;
    const phoneLabel = intl.formatMessage({id: 'mobile.calls_phone', defaultMessage: 'Phone'});
    const tabletLabel = intl.formatMessage({id: 'mobile.calls_tablet', defaultMessage: 'Tablet'});
    const speakerLabel = intl.formatMessage({id: 'mobile.calls_speaker', defaultMessage: 'SpeakerPhone'});
    const bluetoothLabel = intl.formatMessage({id: 'mobile.calls_bluetooth', defaultMessage: 'Bluetooth'});

    const deviceSelector = useCallback(async () => {
        const currentDevice = audioDeviceInfo.selectedAudioDevice;
        const available = audioDeviceInfo.availableAudioDeviceList;
        const selectDevice = (device: AudioDevice) => {
            setPreferredAudioRoute(device);
            dismissBottomSheet();
        };

        const renderContent = () => {
            return (
                <View>
                    {available.includes(AudioDevice.Earpiece) && isTablet &&
                        <SlideUpPanelItem
                            icon={'tablet'}
                            onPress={() => selectDevice(AudioDevice.Earpiece)}
                            text={tabletLabel}
                            textStyles={currentDevice === AudioDevice.Earpiece ? {...style.bold, color} : {}}
                        />
                    }
                    {available.includes(AudioDevice.Earpiece) && !isTablet &&
                        <SlideUpPanelItem
                            icon={'cellphone'}
                            onPress={() => selectDevice(AudioDevice.Earpiece)}
                            text={phoneLabel}
                            textStyles={currentDevice === AudioDevice.Earpiece ? {...style.bold, color} : {}}
                        />
                    }
                    {available.includes(AudioDevice.Speakerphone) &&
                        <SlideUpPanelItem
                            icon={'volume-high'}
                            onPress={() => selectDevice(AudioDevice.Speakerphone)}
                            text={speakerLabel}
                            textStyles={currentDevice === AudioDevice.Speakerphone ? {...style.bold, color} : {}}
                        />
                    }
                    {available.includes(AudioDevice.Bluetooth) &&
                        <SlideUpPanelItem
                            icon={'bluetooth'}
                            onPress={() => selectDevice(AudioDevice.Bluetooth)}
                            text={bluetoothLabel}
                            textStyles={currentDevice === AudioDevice.Bluetooth ? {...style.bold, color} : {}}
                        />
                    }
                </View>
            );
        };

        await bottomSheet({
            closeButtonId: 'close-other-actions',
            renderContent,
            snapPoints: [1, bottomSheetSnapPoint(audioDeviceInfo.availableAudioDeviceList.length + 1, ITEM_HEIGHT, bottom)],
            title: intl.formatMessage({id: 'mobile.calls_audio_device', defaultMessage: 'Select audio device'}),
            theme,
        });
    }, [setPreferredAudioRoute, audioDeviceInfo, color]);

    let icon = 'volume-high';
    let label = speakerLabel;
    switch (audioDeviceInfo.selectedAudioDevice) {
        case AudioDevice.Earpiece:
            icon = isTablet ? 'tablet' : 'cellphone';
            label = isTablet ? tabletLabel : phoneLabel;
            break;
        case AudioDevice.Bluetooth:
            icon = 'bluetooth';
            label = bluetoothLabel;
            break;
    }

    return (
        <Pressable
            style={pressableStyle}
            onPress={deviceSelector}
        >
            <CompassIcon
                name={icon}
                size={24}
                style={iconStyle}
            />
            <Text style={buttonTextStyle}>{label}</Text>
        </Pressable>
    );
};

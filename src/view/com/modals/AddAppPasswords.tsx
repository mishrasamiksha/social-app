import React, {useState} from 'react'
import {StyleSheet, TextInput, View, TouchableOpacity} from 'react-native'
import {Text} from '../util/text/Text'
import {Button} from '../util/forms/Button'
import {s} from 'lib/styles'
import {useStores} from 'state/index'
import {usePalette} from 'lib/hooks/usePalette'
import {isNative} from 'platform/detection'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import Clipboard from '@react-native-clipboard/clipboard'
import * as Toast from '../util/Toast'

export const snapPoints = ['70%']

const shadesOfBlue: string[] = [
  'AliceBlue',
  'Aqua',
  'Aquamarine',
  'Azure',
  'BabyBlue',
  'Blue',
  'BlueViolet',
  'CadetBlue',
  'CornflowerBlue',
  'Cyan',
  'DarkBlue',
  'DarkCyan',
  'DarkSlateBlue',
  'DeepSkyBlue',
  'DodgerBlue',
  'ElectricBlue',
  'LightBlue',
  'LightCyan',
  'LightSkyBlue',
  'LightSteelBlue',
  'MediumAquaMarine',
  'MediumBlue',
  'MediumSlateBlue',
  'MidnightBlue',
  'Navy',
  'PowderBlue',
  'RoyalBlue',
  'SkyBlue',
  'SlateBlue',
  'SteelBlue',
  'Teal',
  'Turquoise',
]

export function Component({}: {}) {
  const pal = usePalette('default')
  const store = useStores()
  const [name, setName] = useState(
    shadesOfBlue[Math.floor(Math.random() * shadesOfBlue.length)],
  )
  const [appPassword, setAppPassword] = useState<string>()
  const [wasCopied, setWasCopied] = useState(false)

  const onCopy = React.useCallback(() => {
    if (appPassword) {
      Clipboard.setString(appPassword)
      Toast.show('Copied to clipboard')
      setWasCopied(true)
    }
  }, [appPassword])

  const onDone = React.useCallback(() => {
    store.shell.closeModal()
  }, [store])

  const createAppPassword = async () => {
    // if name is all whitespace, we don't allow it
    if (!name || !name.trim()) {
      Toast.show(
        'Please enter a name for your app password. All spaces is not allowed.',
      )
      return
    }
    // if name is too short (under 4 chars), we don't allow it
    if (name.length < 4) {
      Toast.show('App Password names must be at least 4 characters long.')
      return
    }

    try {
      const newPassword = await store.me.createAppPassword(name)
      if (newPassword) {
        setAppPassword(newPassword.password)
      } else {
        Toast.show('Failed to create app password.')
        // TODO: better error handling (?)
      }
    } catch (e) {
      Toast.show('Failed to create app password.')
      store.log.error('Failed to create app password', {e})
    }
  }

  const _onChangeText = (text: string) => {
    // sanitize input
    // we only all alphanumeric characters, spaces, dashes, and underscores
    // if the user enters anything else, we ignore it and shake the input container
    // also, it cannot start with a space
    if (text.match(/^[a-zA-Z0-9-_ ]*$/)) {
      setName(text)
    } else {
      Toast.show(
        'App Password names can only contain letters, numbers, spaces, dashes, and underscores.',
      )
    }
  }

  return (
    <View style={[styles.container, pal.view]} testID="addAppPasswordsModal">
      <View>
        {!appPassword ? (
          <Text type="lg" style={[pal.text]}>
            Please enter a unique name for this App Password or use our randomly
            generated one.
          </Text>
        ) : (
          <Text type="lg" style={[pal.text]}>
            <Text type="lg-bold" style={[pal.text]}>
              Here is your app password.
            </Text>{' '}
            Use this to sign into the other app along with your handle.
          </Text>
        )}
        {!appPassword ? (
          <View style={[pal.btn, styles.textInputWrapper]}>
            <TextInput
              style={[styles.input, pal.text]}
              onChangeText={_onChangeText}
              value={name}
              placeholder="Enter a name for this App Password"
              placeholderTextColor={pal.colors.textLight}
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              autoFocus={true}
              maxLength={32}
              selectTextOnFocus={true}
              multiline={true} // need this to be true otherwise selectTextOnFocus doesn't work
              numberOfLines={1} // hack for multiline so only one line shows (android)
              scrollEnabled={false} // hack for multiline so only one line shows (ios)
              blurOnSubmit={true} // hack for multiline so it submits
              editable={!appPassword}
              returnKeyType="done"
              onEndEditing={createAppPassword}
              accessible={true}
              accessibilityLabel="Name"
              accessibilityHint="Input name for app password"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[pal.border, styles.passwordContainer, pal.btn]}
            onPress={onCopy}
            accessibilityRole="button"
            accessibilityLabel="Copy"
            accessibilityHint="Copies app password">
            <Text type="2xl-bold" style={[pal.text]}>
              {appPassword}
            </Text>
            {wasCopied ? (
              <Text style={[pal.textLight]}>Copied</Text>
            ) : (
              <FontAwesomeIcon
                icon={['far', 'clone']}
                style={pal.text as FontAwesomeIconStyle}
                size={18}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {appPassword ? (
        <Text type="lg" style={[pal.textLight, s.mb10]}>
          For security reasons, you won't be able to view this again. If you
          lose this password, you'll need to generate a new one.
        </Text>
      ) : (
        <Text type="xs" style={[pal.textLight, s.mb10, s.mt2]}>
          Can only contain letters, numbers, spaces, dashes, and underscores.
          Must be at least 4 characters long, but no more than 32 characters
          long.
        </Text>
      )}
      <View style={styles.btnContainer}>
        <Button
          type="primary"
          label={!appPassword ? 'Create App Password' : 'Done'}
          style={styles.btn}
          labelStyle={styles.btnLabel}
          onPress={!appPassword ? createAppPassword : onDone}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: isNative ? 50 : 0,
    paddingHorizontal: 16,
  },
  textInputWrapper: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 6,
    fontSize: 17,
    letterSpacing: 0.25,
    fontWeight: '400',
    borderRadius: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    paddingHorizontal: 60,
    paddingVertical: 14,
  },
  btnLabel: {
    fontSize: 18,
  },
  groupContent: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

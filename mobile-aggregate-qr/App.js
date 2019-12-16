import * as React from 'react';
import { Text, View, StyleSheet, Button, ScrollView, Clipboard, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Toast from 'react-native-easy-toast'

class QrCodeScanner extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      hasCameraPermission: null,
      scanned: false,
      text: {}
    };
  }

  async componentDidMount() {
    await this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    await this.setState({ hasCameraPermission: status === 'granted' });
  };

  handleBarCodeScanned = async ({ data }) => {
    const key = Object.keys(JSON.parse(data))[0]
    if (Object.keys(this.state.text).length === 0) {
      if (key !== '1') {
        await Alert.alert('This is not 1')
        return
      }
    }

    if (key !== `${Object.keys(this.state.text).length + 1}`) {
      await Alert.alert(`This is not the next one, it should be ${Object.keys(this.state.text).length + 1}`)
      return
    }

    await this.refs.toast.show('scanned!');
    
    await this.setState({
      scanned: true,
      text: {
        ...this.state.text,
        [key]: JSON.parse(data)[key]
      }
    });
  };

  renderRainbowText = (t) => {
    const remainder = Number.parseInt(t) % 10
    return (
      <Text style={styles[remainder]} key={t}>{this.state.text[t]}</Text>
    )
  }

  renderTexts = () => {
    return Object.keys(this.state.text).map((t) => {
      return this.renderRainbowText(t)
    })
  }

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <ScrollView stryle={styles.textContainer}>
          {this.renderTexts()}
          {scanned && <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />}  
        </ScrollView>
        <Button
          disabled={Object.keys(this.state.text).length !== 132}
          title={'Copy bro'}
          onPress={
            () => {
              const textForCopy = Object.keys(this.state.text).map((t) => this.state.text[t]).join('')
              Clipboard.setString(textForCopy)
            }}
        />
        <Toast ref="toast"/>
      </View>
    );
  }
}

export default function App() {
  return (
    <View style={styles.container}>
      <QrCodeScanner/>
    </View>
  );
}

const textStyle = {
  fontWeight: '500',
  fontSize: 16
}

const colorsStyles = {
  1: {
    ...textStyle,
    color: '#141823'
  },
  2: {
    ...textStyle,
    color: '#e18'
  },
  3: {
    ...textStyle,
    color: '#888'
  },
  4: {
    ...textStyle,
    color: '#662'
  },
  5: {
    ...textStyle,
    color: '#515'
  },
  6: {
    ...textStyle,
    color: '#ee3'
  },
  7: {
    ...textStyle,
    color: '#220eee'
  },
  8: {
    ...textStyle,
    color: '#32eeee'
  },
  9: {
    ...textStyle,
    color: '#fff'
  },
  0: {
    ...textStyle,
    color: '#cff'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textContainer: {
    height: 300,
    width: '100%'
  },
  ...colorsStyles
});

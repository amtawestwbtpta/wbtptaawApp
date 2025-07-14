import {Dimensions, Modal, StyleSheet, View} from 'react-native';
import React from 'react';
import * as Progress from 'react-native-progress';
const {width, height} = Dimensions.get('window');
const Loader = ({visible}) => {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.modalView}>
        <View style={styles.mainView}>
          <Progress.CircleSnail
            color={['red', 'green', 'blue']}
            thickness={4}
            size={50}
          />
        </View>
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  modalView: {
    width: width,
    height: height,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: 75,
    height: 75,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

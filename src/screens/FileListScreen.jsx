// FileListScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import fileListData from '../modules/fileList';

// Import your file list data

const FileListScreen = () => {
  const navigation = useNavigation();

  const handleItemPress = fileName => {
    navigation.navigate('WebViewScreen', { fileName });
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item.fileName)}
    >
      <Text style={styles.itemText}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>West Bengal Government Tools</Text>
        <Text style={styles.subtitle}>Official Calculators and Resources</Text>
        {/* <Text style={styles.subtitle}>Credit WB Calculator Hub</Text> */}
      </View>

      <FlatList
        data={fileListData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>WBTPTA AMTA WEST CIRCLE</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  header: {
    backgroundColor: '#1a4b8c',
    padding: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // marginBottom: 5,
    elevation: 5,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: '#c3d9fdff',
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4b8c',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#1a4b8c',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default FileListScreen;

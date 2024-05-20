import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, StatusBar, Image, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const HomePage = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [realIpAddress, setRealIpAddress] = useState('');
  const [vpnIpAddress, setVpnIpAddress] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [cities, setCities] = useState([]);
  const [connectedCity, setConnectedCity] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [metrics, setMetrics] = useState({ download: '--', upload: '--', ping: '--' });

  useEffect(() => {
    const fetchIpAddress = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setRealIpAddress(response.data.ip || 'Unknown');
      } catch (error) {
        console.error('Error fetching IP address:', error);
        setRealIpAddress('Unknown');
      }
    };

    const mockCities = {
      America: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Tampa'],
      Europe: ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Milan', 'Amsterdam'],
      Asia: ['Tokyo', 'Beijing', 'Seoul', 'Bangkok', 'Singapore', 'Manila'],
      Africa: ['Casablanca', 'Istanbul', 'Dubai', 'Abu Dhabi', 'Cape Town', 'Cairo'],
    };

    setCities(mockCities);

    fetchIpAddress();
  }, []);

  const toggleSwitch = () => {
    setIsEnabled(prevState => !prevState);
    if (!isEnabled) {
      setConnectedCity(null); // Disconnect when toggling off
      setMetrics({ download: '--', upload: '--', ping: '--' });
      setVpnIpAddress(''); // Clear VPN IP address
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setConnectedCity(null);
    setIsModalVisible(false); // Close modal after selecting country
  };

  const generateRandomMetrics = () => {
    return {
      download: (Math.random() * (100 - 50) + 50).toFixed(1),
      upload: (Math.random() * (60 - 20) + 20).toFixed(1),
      ping: (Math.random() * (30 - 10) + 10).toFixed(0),
    };
  };

  const generateRandomIpAddress = () => {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  };

  const handleConnectToRandomCity = () => {
    if (!selectedCountry || !cities[selectedCountry.name]) return;

    const availableCities = cities[selectedCountry.name];
    const randomCity = availableCities[Math.floor(Math.random() * availableCities.length)];

    console.log(`Connecting to ${randomCity} in ${selectedCountry.name}, ip address ${vpnIpAddress}`);
    setConnectedCity(randomCity);
    setMetrics(generateRandomMetrics());
    setVpnIpAddress(generateRandomIpAddress());
    setIsEnabled(true); // Enable VPN when connected
  };

  const ImportantCountries = [
    { name: 'America', label: 'America', status: 'Online' },
    { name: 'Europe', label: 'Europe', status: 'Online' },
    { name: 'Asia', label: 'Asia Pacific', status: 'Online' },
    { name: 'Africa', label: 'Africa and the Middle East', status: 'Offline' },
  ];

  const renderModalContent = () => (
    <View style={styles.modalContainer}>
    <Text style={styles.modalTitle}>All Server</Text>
    <FlatList
      data={ImportantCountries}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.modalItem}
          onPress={() => handleCountrySelect(item)}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '400' }}>{item.label}</Text>
            <Ionicons name="ellipse" size={11} color={item.status === 'Online' ? 'green' : 'red'} style={{ marginLeft: 8 }} />
            <Text style={{ marginLeft: 8, color: item.status === 'Online' ? 'green' : 'red' }}>{item.status}</Text>
          </View>
        </TouchableOpacity>

      )}

    />
  </View>
);


  return (
    <View style={[styles.container, { backgroundColor: isEnabled ? '#c7f9cc' : 'lightsalmon' }]}>
      <StatusBar backgroundColor="#131b1b" barStyle="dark-content" />
      <View style={styles.content}>
        <Switch
          trackColor={{ false: 'salmon', true: '#c9e4ca' }}
          thumbColor={isEnabled ? '#c7f9cc' : 'lightsalmon'}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Ionicons name="menu-outline" size={40} color="black" />
      </View>

      <View style={styles.content1}>
        <Text style={styles.label}>
          {isEnabled ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 17, fontWeight: '300', color: '#333', bottom: 3 }}>
                <Ionicons style={styles.adj} name="lock-closed-outline" size={20} color="black" /> Connected
              </Text>
            </View>

          ) : (
            <View style={{ flexDirection: 'row' }}>
              <Ionicons style={styles.adj} name="warning-outline" size={22} color="black" />
              <Text style={{ fontSize: 17, fontWeight: '300', color: '#333', top: 1 }}>
                Disconnected
              </Text>
            </View>
          )}
        </Text>

        {isEnabled ? (
          <Text style={styles.ipText}>VPN IP: {vpnIpAddress || 'Loading...'}</Text>
        ) : (
          <Text style={styles.ipText}>Your IP: {realIpAddress || 'Loading...'}</Text>
        )}
      </View>

      <Image source={require('../assets/globe.png')} style={{ alignSelf: 'center', height: 396, top: -15 }} />

      <View style={styles.vpnLocationContainer}>
        <Text style={styles.locationTitle}> VPN Location</Text>
        <View style={styles.locationRow}>
          <Text style={{ fontSize: 30, fontWeight: '300', marginRight: 15 }}>
            {isEnabled && connectedCity ? ` ${connectedCity}` : 'Connect to a city'}
          </Text>
          <Ionicons style={{ marginRight: 15 }} name="cellular-outline" size={27} color="black" />
          <TouchableOpacity style={styles.changeButton} onPress={() => setIsModalVisible(true)}>
            <Text>Change</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={25} color="black" />
          <Text style={styles.countryText}>
            {isEnabled && selectedCountry ? selectedCountry.label : 'Select a country'}
          </Text>
        </View>

        <View
          style={{
            height: 1,
            marginTop: 15,
            marginBottom: 15,
            backgroundColor: '#333',
            alignSelf: 'stretch',
          }}
        />

        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <View style={{ flexDirection: 'row', alignContent: 'center' }}>
              <Text style={styles.metricValue}>{isEnabled ? metrics.download : '--'}</Text>
              <Text style={styles.metricLabel}>Mbps</Text>
            </View>
            <Text style={styles.metricTitle}>Download</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={{ flexDirection: 'row', alignContent: 'center' }}>
              <Text style={styles.metricValue}>{isEnabled ? metrics.upload : '--'}</Text>
              <Text style={styles.metricLabel}>Mbps</Text>
            </View>
            <Text style={styles.metricTitle}>Upload</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={{ flexDirection: 'row', alignContent: 'center' }}>
              <Text style={styles.metricValue}>{isEnabled ? metrics.ping : '--'}</Text>
              <Text style={styles.metricLabel}>ms</Text>
            </View>
            <Text style={styles.metricTitle}>Ping</Text>
          </View>
        </View>

        {!isEnabled && selectedCountry && !connectedCity ? (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnectToRandomCity}>
            <Text style={{ fontSize: 20, color: 'white', textAlign: 'center' }}>Connect</Text>
          </TouchableOpacity>
        ) : (
          isEnabled && (
            <TouchableOpacity style={styles.disconnectButton} onPress={toggleSwitch}>
              <Text style={{ fontSize: 20, color: 'white', textAlign: 'center' }}>Disconnect</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>{renderModalContent()}</View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'lightsalmon',
  },
  content: {
    paddingTop: StatusBar.currentHeight + 80,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    top: 46,
    fontSize: 15,
    fontWeight: '300',
    color: '#333',
    marginLeft: 25,
  },
  content1: {
    flexDirection: 'row', // Arrange children horizontally
    alignItems: 'center', // Align children vertically
    justifyContent: 'space-between', // Space evenly between children
    marginBottom: 20, // Bottom margin for spacing
    width: '100%', // Occupy full width of parent
  },
  adj:{
    alignSelf:'flex-start',
    marginRight:5,
    bottom:2
  },
  ipText: {
    top: 45,
    left: 205,
    fontSize: 17,
    fontWeight: '300',
    color: '#333',
  },
  vpnLocationContainer: {
    alignItems: 'flex-start',
    marginTop: -50,
    paddingHorizontal: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countryText: {
    fontSize: 19,
    fontWeight: '300',
    marginLeft: 5,
  },
  metrics: {
    top:5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginVertical: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    marginTop:18,
    fontSize: 24,
    fontWeight: '400',
  },
  metricLabel: {
    marginTop:23,
    marginLeft:7,
    fontSize: 16,
    color: '#333',
  },
  metricTitle: { 
    bottom:60,
    marginRight:18,
    alignSelf:'center',
    fontSize: 16,
    color: '#333',
  },
  connectButton: {
    marginTop: 3,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 35,
    alignSelf: 'center',
    paddingHorizontal: 60,
    paddingVertical: 14,
    backgroundColor: 'black',
  },
  disconnectButton: {
    marginTop: 3,
    borderRadius: 35,
    alignSelf: 'center',
    paddingHorizontal: 60,
    paddingVertical: 14,
    backgroundColor: 'black',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContainer: {
    backgroundColor: '#e6e6e9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    flexDirection:'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default HomePage;


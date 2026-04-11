// @ts-ignore
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// @ts-ignore
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// @ts-ignore
import { MotiView } from 'moti';
// @ts-ignore
import { Navigation, Users } from 'lucide-react-native';
import { useAppStore } from '../store';
import { useTracking } from '../hooks/useTracking';

const MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#07111F" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#00F0FF" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#07111F" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#0B1B32" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0A2A43" }] }
];

export const TacticalMap = () => {
  const { location } = useTracking();
  const peers = useAppStore((s: any) => s.peers);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const renderPeers = () => {
    return Object.values(peers).map((peer: any) => {
      const isLost = now - peer.lastSeen > 30000; // Dead-Reckoning Task 3
      const markerColor = peer.isSOS ? "#FF4D6D" : (isLost ? "#6C7A89" : "#00F0FF");

      return (
        <Marker
          key={peer.id}
          coordinate={{ latitude: peer.latitude, longitude: peer.longitude }}
          title={peer.callsign}
          description={`Speed: ${peer.speed}km/h | Risk: ${peer.riskScore}`}
        >
          <View style={styles.markerContainer}>
            {peer.isSOS && (
              <MotiView
                from={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                style={styles.sosRipple}
              />
            )}
            <View style={[styles.triangle, { borderBottomColor: markerColor }]} />
            <Text style={[styles.callsign, { color: markerColor }]}>
              {peer.callsign}
            </Text>
            {isLost && (
              <Text style={styles.lastSeen}>
                LAST: {new Date(peer.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </Marker>
      );
    });
  };

  if (!location) return null;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User Current Position */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
        >
          <View style={styles.userMarker}>
            <Navigation size={20} color="#00F0FF" fill="#00F0FF" />
          </View>
        </Marker>

        {renderPeers()}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.peerCount}>
          <Users size={14} color="#00F0FF" />
          <Text style={styles.peerText}>{Object.keys(peers).length} PEERS ONLINE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker: {
    transform: [{ rotate: '45deg' }],
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00F0FF',
  },
  callsign: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    backgroundColor: '#07111F',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  lastSeen: {
    fontSize: 8,
    color: '#6C7A89',
    backgroundColor: '#07111F',
  },
  sosRipple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4D6D',
  },
  overlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  peerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(7, 17, 31, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  peerText: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

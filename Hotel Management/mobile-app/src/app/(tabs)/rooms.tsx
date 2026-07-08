import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, Modal,
  TextInput, Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Room = {
  id: string; type: string; floor: string; status: string;
  price: number; guest: string; checkIn?: string; checkOut?: string;
};

const initialRooms: Room[] = [
  { id: '101', type: 'Deluxe', floor: '1st', status: 'available', price: 3500, guest: '' },
  { id: '102', type: 'Standard', floor: '1st', status: 'occupied', price: 2200, guest: 'Amit Sharma', checkIn: '27 Mar', checkOut: '30 Mar' },
  { id: '103', type: 'Suite', floor: '1st', status: 'occupied', price: 6500, guest: 'Priya Singh', checkIn: '28 Mar', checkOut: '31 Mar' },
  { id: '104', type: 'Standard', floor: '1st', status: 'maintenance', price: 2200, guest: '' },
  { id: '201', type: 'Deluxe', floor: '2nd', status: 'occupied', price: 3500, guest: 'Rahul Verma', checkIn: '26 Mar', checkOut: '29 Mar' },
  { id: '202', type: 'Suite', floor: '2nd', status: 'available', price: 6500, guest: '' },
  { id: '203', type: 'Standard', floor: '2nd', status: 'available', price: 2200, guest: '' },
  { id: '204', type: 'Deluxe', floor: '2nd', status: 'reserved', price: 3500, guest: 'Guest arriving 4PM' },
  { id: '301', type: 'Premium Suite', floor: '3rd', status: 'occupied', price: 9500, guest: 'VIP - Mr. Kapoor', checkIn: '25 Mar', checkOut: '1 Apr' },
  { id: '302', type: 'Deluxe', floor: '3rd', status: 'available', price: 3500, guest: '' },
];

export default function RoomsScreen() {
  const { colors: c } = useTheme();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [filter, setFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [nights, setNights] = useState('1');

  const [roomSearch, setRoomSearch] = useState('');

  const statusCfg: Record<string, { color: string; label: string; icon: IconName }> = {
    available: { color: c.success, label: 'Available', icon: 'checkmark-circle' },
    occupied: { color: c.accent, label: 'Occupied', icon: 'person' },
    reserved: { color: c.warning, label: 'Reserved', icon: 'time' },
    maintenance: { color: c.danger, label: 'Maintenance', icon: 'construct' },
  };

  const filters = ['all', 'available', 'occupied', 'reserved', 'maintenance'];
  const filteredRooms = rooms.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = roomSearch === '' || r.id.includes(roomSearch) || r.type.toLowerCase().includes(roomSearch.toLowerCase()) || r.guest.toLowerCase().includes(roomSearch.toLowerCase());
    return matchFilter && matchSearch;
  });
  const counts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    reserved: rooms.filter(r => r.status === 'reserved').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const openBooking = (room: Room) => {
    setBookingRoom(room);
    setGuestName('');
    setGuestPhone('');
    setNights('1');
    setSelectedRoom(null);
    setShowBooking(true);
  };

  const confirmBooking = () => {
    if (!guestName.trim()) { Alert.alert('Required', 'Please enter guest name'); return; }
    if (!bookingRoom) return;
    setRooms(prev => prev.map(r => r.id === bookingRoom.id ? {
      ...r, status: 'occupied', guest: guestName.trim(),
      checkIn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      checkOut: new Date(Date.now() + parseInt(nights || '1') * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    } : r));
    setShowBooking(false);
    Alert.alert('Booked!', `Room ${bookingRoom.id} booked for ${guestName.trim()}`);
  };

  const checkoutRoom = (room: Room) => {
    Alert.alert('Checkout', `Checkout ${room.guest} from Room ${room.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Checkout', style: 'destructive', onPress: () => {
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'available', guest: '', checkIn: undefined, checkOut: undefined } : r));
        setSelectedRoom(null);
      }},
    ]);
  };

  const markMaintenance = (room: Room) => {
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'maintenance', guest: '' } : r));
    setSelectedRoom(null);
  };

  const clearMaintenance = (room: Room) => {
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: 'available' } : r));
    setSelectedRoom(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: c.text }}>Rooms</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>{rooms.length} Rooms • {counts.available} Available</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Add Room', 'Room management is handled from the web dashboard.')}>
            <LinearGradient colors={[c.accent, c.accentDark]} style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput style={{ flex: 1, paddingVertical: 10, marginLeft: 10, fontSize: 14, color: c.text }} placeholder="Search rooms, guests..." placeholderTextColor={c.textMuted} value={roomSearch} onChangeText={setRoomSearch} />
          {roomSearch.length > 0 && (
            <TouchableOpacity onPress={() => setRoomSearch('')}>
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs - explicit fixed height */}
        <View style={{ height: 38, marginBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
            {filters.map(f => (
              <TouchableOpacity key={f} style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginRight: 8,
                backgroundColor: filter === f ? c.accent : c.card,
                borderWidth: 1, borderColor: filter === f ? c.accent : c.border,
              }} onPress={() => setFilter(f)}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: filter === f ? '#fff' : c.textSecondary }}>{f === 'all' ? 'All' : statusCfg[f].label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Room Grid */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          {/* Summary Stats Row */}
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            {(Object.entries(counts) as [string, number][]).map(([key, count], idx) => {
              const cfg = statusCfg[key];
              return (
                <TouchableOpacity key={key} onPress={() => setFilter(key === filter ? 'all' : key)} style={{
                  flex: 1, backgroundColor: filter === key ? cfg.color + '20' : c.card,
                  borderRadius: 12, paddingVertical: 12, alignItems: 'center',
                  borderWidth: 1, borderColor: filter === key ? cfg.color : c.border,
                  marginRight: idx < 3 ? 8 : 0,
                }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.color, marginBottom: 6 }} />
                  <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>{count}</Text>
                  <Text style={{ fontSize: 9, color: c.textSecondary, fontWeight: '600', marginTop: 2 }}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Room Cards Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {filteredRooms.map((room, i) => {
              const cfg = statusCfg[room.status];
              return (
                <TouchableOpacity key={room.id} onPress={() => setSelectedRoom(room)} style={{
                  width: CARD_W, backgroundColor: c.card, borderRadius: 16, padding: 14,
                  marginBottom: 10, borderWidth: 1, borderColor: c.border,
                  marginRight: i % 2 === 0 ? 12 : 0,
                }} activeOpacity={0.7}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cfg.color, marginRight: 6 }} />
                      <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{room.id}</Text>
                    </View>
                    <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: cfg.color + '18', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={cfg.icon} size={10} color={cfg.color} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: c.textSecondary, marginBottom: 2 }} numberOfLines={1}>{room.type}</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted, marginBottom: 6 }}>{room.floor} Floor</Text>
                  {room.guest ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="person" size={10} color={c.textSecondary} />
                      <Text style={{ fontSize: 10, color: c.textSecondary, marginLeft: 4, flex: 1 }} numberOfLines={1}>{room.guest}</Text>
                    </View>
                  ) : null}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.accent }}>₹{room.price.toLocaleString()}<Text style={{ fontSize: 9, fontWeight: '400', color: c.textMuted }}>/night</Text></Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ====== ROOM DETAIL MODAL ====== */}
        <Modal visible={!!selectedRoom} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            {selectedRoom && (() => {
              const cfg = statusCfg[selectedRoom.status];
              return (
                <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 32 }}>
                  <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.textMuted }} />
                  </View>
                  <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Room {selectedRoom.id}</Text>
                      <TouchableOpacity onPress={() => setSelectedRoom(null)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.border }}>
                        <Ionicons name="close" size={18} color={c.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: c.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cfg.color, marginRight: 8 }} />
                          <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{cfg.label}</Text>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: c.accent }}>₹{selectedRoom.price.toLocaleString()}/night</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>TYPE</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{selectedRoom.type}</Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>FLOOR</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{selectedRoom.floor}</Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>CAPACITY</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{selectedRoom.type === 'Suite' || selectedRoom.type === 'Premium Suite' ? '4' : '2'} Guests</Text>
                        </View>
                      </View>
                    </View>

                    {selectedRoom.guest ? (
                      <View style={{ backgroundColor: c.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 12 }}>GUEST DETAILS</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                          <Ionicons name="person" size={16} color={c.accent} />
                          <Text style={{ fontSize: 15, fontWeight: '600', color: c.text, marginLeft: 10 }}>{selectedRoom.guest}</Text>
                        </View>
                        {selectedRoom.checkIn && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                            <View>
                              <Text style={{ fontSize: 11, color: c.textMuted }}>CHECK IN</Text>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: c.success }}>{selectedRoom.checkIn}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={16} color={c.textMuted} style={{ alignSelf: 'center' }} />
                            <View>
                              <Text style={{ fontSize: 11, color: c.textMuted }}>CHECK OUT</Text>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: c.danger }}>{selectedRoom.checkOut}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    ) : null}

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      {selectedRoom.status === 'available' && (
                        <>
                          <TouchableOpacity onPress={() => openBooking(selectedRoom)} style={{ flex: 1, marginRight: 8, borderRadius: 14, overflow: 'hidden' }}>
                            <LinearGradient colors={[c.accent, c.accentDark]} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                              <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 6 }} />
                              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Book Now</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => markMaintenance(selectedRoom)} style={{ flex: 1, marginLeft: 8, backgroundColor: c.warning + '15', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: c.warning + '30' }}>
                            <Ionicons name="construct" size={16} color={c.warning} style={{ marginRight: 6 }} />
                            <Text style={{ color: c.warning, fontWeight: '700', fontSize: 14 }}>Maintenance</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {selectedRoom.status === 'occupied' && (
                        <TouchableOpacity onPress={() => checkoutRoom(selectedRoom)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                          <LinearGradient colors={[c.danger, '#dc2626']} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                            <Ionicons name="log-out" size={16} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Checkout Guest</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                      {selectedRoom.status === 'reserved' && (
                        <TouchableOpacity onPress={() => openBooking(selectedRoom)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                          <LinearGradient colors={[c.success, '#059669']} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                            <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Check In Guest</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                      {selectedRoom.status === 'maintenance' && (
                        <TouchableOpacity onPress={() => clearMaintenance(selectedRoom)} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                          <LinearGradient colors={[c.success, '#059669']} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                            <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Mark Available</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScrollView>
                </View>
              );
            })()}
          </View>
        </Modal>

        {/* ====== BOOKING MODAL ====== */}
        <Modal visible={showBooking} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 32 }}>
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.textMuted }} />
              </View>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Book Room {bookingRoom?.id}</Text>
                  <TouchableOpacity onPress={() => setShowBooking(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.border }}>
                    <Ionicons name="close" size={18} color={c.textSecondary} />
                  </TouchableOpacity>
                </View>

                {bookingRoom && (
                  <View style={{ backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: c.border, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{bookingRoom.type}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.accent }}>₹{bookingRoom.price}/night</Text>
                  </View>
                )}

                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>GUEST NAME *</Text>
                <View style={{ backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                  <TextInput style={{ paddingVertical: 14, fontSize: 15, color: c.text }} placeholder="Enter guest name" placeholderTextColor={c.textMuted} value={guestName} onChangeText={setGuestName} />
                </View>

                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>PHONE NUMBER</Text>
                <View style={{ backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                  <TextInput style={{ paddingVertical: 14, fontSize: 15, color: c.text }} placeholder="Enter phone number" placeholderTextColor={c.textMuted} value={guestPhone} onChangeText={setGuestPhone} keyboardType="phone-pad" />
                </View>

                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>NUMBER OF NIGHTS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={() => setNights(String(Math.max(1, parseInt(nights || '1') - 1)))} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="remove" size={18} color={c.textSecondary} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginHorizontal: 24 }}>{nights}</Text>
                  <TouchableOpacity onPress={() => setNights(String(parseInt(nights || '1') + 1))} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="add" size={18} color={c.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: c.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: c.border, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: c.textSecondary }}>Total Amount</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: c.accent }}>₹{((bookingRoom?.price || 0) * parseInt(nights || '1')).toLocaleString()}</Text>
                </View>

                <TouchableOpacity onPress={confirmBooking} style={{ borderRadius: 14, overflow: 'hidden' }}>
                  <LinearGradient colors={[c.accent, c.accentDark]} style={{ paddingVertical: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Confirm Booking</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

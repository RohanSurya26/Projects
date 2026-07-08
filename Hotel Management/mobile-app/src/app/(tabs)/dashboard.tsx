import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Animated, Dimensions, Modal, FlatList,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_W = (width - 56) / 2;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const notifications = [
  { id: '1', title: 'New Booking', msg: 'Room 202 booked by Priya Singh for 3 nights', time: '5 min ago', icon: 'calendar' as IconName, color: '#6C63FF' },
  { id: '2', title: 'Payment Received', msg: '₹6,500 received for Room 103', time: '18 min ago', icon: 'card' as IconName, color: '#10b981' },
  { id: '3', title: 'KOT Alert', msg: 'Order #1043 is ready for serving', time: '25 min ago', icon: 'flame' as IconName, color: '#f59e0b' },
  { id: '4', title: 'Checkout Reminder', msg: 'Room 201 checkout due in 1 hour', time: '32 min ago', icon: 'time' as IconName, color: '#ef4444' },
  { id: '5', title: 'Staff Update', msg: 'Rajesh marked present for evening shift', time: '1 hr ago', icon: 'people' as IconName, color: '#ec4899' },
  { id: '6', title: 'Maintenance Done', msg: 'Room 104 maintenance completed', time: '2 hrs ago', icon: 'construct' as IconName, color: '#f59e0b' },
];

function MetricCard({ title, value, trend, trendUp, icon, gradient, i, c }: {
  title: string; value: string; trend: string; trendUp: boolean;
  icon: IconName; gradient: [string, string]; i: number; c: ReturnType<typeof useTheme>['colors'];
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]).start();
    }, 100 + i * 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={[{
      width: CARD_W, backgroundColor: c.card, borderRadius: 20, padding: 16,
      marginBottom: 12, borderWidth: 1, borderColor: c.border, marginRight: i % 2 === 0 ? 12 : 0,
    }, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={{ marginBottom: 14 }}>
        <LinearGradient colors={gradient} style={{ width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name={icon} size={18} color="#fff" />
        </LinearGradient>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginBottom: 2 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: c.textSecondary, fontWeight: '500', marginBottom: 8 }}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={trendUp ? 'trending-up' : 'trending-down'} size={14} color={trendUp ? c.success : c.danger} />
        <Text style={{ fontSize: 12, fontWeight: '600', color: trendUp ? c.success : c.danger }}> {trend}</Text>
      </View>
    </Animated.View>
  );
}

function ActionCard({ label, icon, gradient, i, c, onPress }: {
  label: string; icon: IconName; gradient: [string, string]; i: number;
  c: ReturnType<typeof useTheme>['colors']; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }).start();
    }, 500 + i * 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={{ width: (width - 68) / 4, transform: [{ scale }] }}>
      <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7} onPress={onPress}>
        <LinearGradient colors={gradient} style={{ width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name={icon} size={20} color="#fff" />
        </LinearGradient>
        <Text style={{ fontSize: 11, color: c.textSecondary, fontWeight: '600' }}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const { colors: c } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState<null | { id: string; table: string; status: string; time: string }>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const headFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const statusIcon = (status: string): { bg: string; text: string; icon: IconName } => {
    const map: Record<string, { bg: string; text: string; icon: IconName }> = {
      Served: { bg: c.success + '20', text: c.success, icon: 'checkmark-circle' },
      Ready: { bg: c.success + '20', text: c.success, icon: 'checkmark-circle' },
      Cooking: { bg: c.warning + '20', text: c.warning, icon: 'flame' },
      Pending: { bg: c.danger + '20', text: c.danger, icon: 'time' },
    };
    return map[status] || map.Pending;
  };

  const orders = [
    { id: '#1042', table: 'Table 4', status: 'Served', time: '12:45 PM', items: 'Chicken Biryani ×2, Mojito ×1', amount: '₹3,072' },
    { id: '#1043', table: 'Room 201', status: 'Cooking', time: '12:50 PM', items: 'Grilled Salmon ×1, Caesar Salad ×1', amount: '₹2,656' },
    { id: '#1044', table: 'Table 12', status: 'Cooking', time: '1:05 PM', items: 'Margherita Pizza ×3', amount: '₹3,735' },
    { id: '#1045', table: 'Takeaway', status: 'Ready', time: '1:15 PM', items: 'Classic Burger ×2, Cappuccino ×2', amount: '₹2,740' },
    { id: '#1046', table: 'Room 305', status: 'Pending', time: '1:22 PM', items: 'Pasta Alfredo ×1, Mojito ×2', amount: '₹2,407' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, opacity: headFade }}>
          <View>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontWeight: '500' }}>{greeting} 👋</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, marginTop: 2 }}>Dashboard</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowNotif(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: c.border }}>
              <Ionicons name="notifications-outline" size={20} color={c.textSecondary} />
              <View style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: c.danger }} />
            </TouchableOpacity>
            <TouchableOpacity style={{ borderRadius: 12, overflow: 'hidden' }} onPress={() => router.navigate('/(tabs)/profile')}>
              <LinearGradient colors={[c.accent, c.accentDark]} style={{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>A</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <MetricCard title="Today's Earnings" value="₹3,52,750" trend="+14.2%" trendUp icon="wallet" gradient={['#6C63FF', '#4834DF']} i={0} c={c} />
            <MetricCard title="Total Bookings" value="124" trend="+8.1%" trendUp icon="calendar" gradient={['#f59e0b', '#d97706']} i={1} c={c} />
            <MetricCard title="Rooms Available" value="42" trend="+5" trendUp icon="bed" gradient={['#10b981', '#059669']} i={2} c={c} />
            <MetricCard title="Active KOTs" value="18" trend="-2" trendUp={false} icon="flame" gradient={['#ef4444', '#dc2626']} i={3} c={c} />
          </View>

          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginTop: 20, marginBottom: 14 }}>QUICK ACTIONS</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ActionCard label="Book" icon="add-circle" gradient={['#6C63FF', '#4834DF']} i={0} c={c} onPress={() => router.navigate('/(tabs)/rooms')} />
            <ActionCard label="Order" icon="cart" gradient={['#10b981', '#059669']} i={1} c={c} onPress={() => router.navigate('/(tabs)/billing')} />
            <ActionCard label="Rooms" icon="bed" gradient={['#f59e0b', '#d97706']} i={2} c={c} onPress={() => router.navigate('/(tabs)/rooms')} />
            <ActionCard label="Report" icon="stats-chart" gradient={['#ec4899', '#db2777']} i={3} c={c} onPress={() => router.navigate('/(tabs)/profile')} />
          </View>

          <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginTop: 24, marginBottom: 14 }}>REVENUE OVERVIEW</Text>
          {(() => {
            const monthData = [
              { label: 'Jan', short: 'J', rev: 845000, growth: '+12.1%' },
              { label: 'Feb', short: 'F', rev: 632000, growth: '+5.4%' },
              { label: 'Mar', short: 'M', rev: 1078000, growth: '+22.8%' },
              { label: 'Apr', short: 'A', rev: 756000, growth: '-8.2%' },
              { label: 'May', short: 'M', rev: 1190000, growth: '+15.6%' },
              { label: 'Jun', short: 'J', rev: 920000, growth: '+3.1%' },
              { label: 'Jul', short: 'J', rev: 1105000, growth: '+11.4%' },
              { label: 'Aug', short: 'A', rev: 798000, growth: '-6.3%' },
              { label: 'Sep', short: 'S', rev: 1245800, growth: '+18.4%' },
              { label: 'Oct', short: 'O', rev: 980000, growth: '+9.7%' },
              { label: 'Nov', short: 'N', rev: 1150000, growth: '+14.2%' },
              { label: 'Dec', short: 'D', rev: 945000, growth: '+7.8%' },
            ];
            const maxRev = Math.max(...monthData.map(m => m.rev));
            const sel = monthData[selectedMonth];
            const isUp = sel.growth.startsWith('+');

            return (
              <View style={{ backgroundColor: c.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: c.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>₹{(sel.rev / 100).toFixed(0).replace(/\B(?=(\d{2})+(?!\d))/g, ',')}</Text>
                    <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>{sel.label} 2026</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: (isUp ? c.success : c.danger) + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                    <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={12} color={isUp ? c.success : c.danger} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: isUp ? c.success : c.danger }}> {sel.growth}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 }}>
                  {monthData.map((m, i) => {
                    const barH = Math.max(12, (m.rev / maxRev) * 90);
                    const isActive = i === selectedMonth;
                    return (
                      <TouchableOpacity key={i} onPress={() => setSelectedMonth(i)} style={{ alignItems: 'center', flex: 1 }} activeOpacity={0.6}>
                        <LinearGradient
                          colors={isActive ? [c.accent, c.accentDark] : [c.cardAlt, c.cardAlt]}
                          style={{ width: isActive ? 12 : 8, height: barH, borderRadius: 4, marginBottom: 6 }}
                        />
                        <Text style={{ fontSize: 9, fontWeight: isActive ? '800' : '600', color: isActive ? c.accent : c.textMuted }}>{m.short}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })()}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5 }}>RECENT ORDERS</Text>
            <TouchableOpacity onPress={() => router.navigate('/(tabs)/billing')}><Text style={{ fontSize: 13, color: c.accent, fontWeight: '600' }}>See All</Text></TouchableOpacity>
          </View>
          <View style={{ backgroundColor: c.card, borderRadius: 20, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            {orders.map((order, idx) => {
              const s = statusIcon(order.status);
              return (
                <TouchableOpacity key={idx} onPress={() => setShowOrderDetail(order)} activeOpacity={0.6} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: idx < orders.length - 1 ? 1 : 0, borderBottomColor: c.border }}>
                  <View style={{ backgroundColor: c.cardAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.text }}>{order.id}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{order.table}</Text>
                    <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{order.time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                    <Ionicons name={s.icon} size={12} color={s.text} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: s.text }}> {order.status}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* ====== NOTIFICATIONS MODAL ====== */}
        <Modal visible={showNotif} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' }}>
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.textMuted }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotif(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.border }}>
                  <Ionicons name="close" size={18} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={notifications}
                keyExtractor={n => n.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.color + '18', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{item.title}</Text>
                      <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>{item.msg}</Text>
                      <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 4 }}>{item.time}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* ====== ORDER DETAIL MODAL ====== */}
        <Modal visible={!!showOrderDetail} animationType="fade" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 }}>
            {showOrderDetail && (() => {
              const s = statusIcon(showOrderDetail.status);
              return (
                <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: c.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>Order {showOrderDetail.id}</Text>
                    <TouchableOpacity onPress={() => setShowOrderDetail(null)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.cardAlt, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="close" size={16} color={c.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                    <Ionicons name="location" size={16} color={c.accent} />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: c.text, marginLeft: 8 }}>{showOrderDetail.table}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                    <Ionicons name="time" size={16} color={c.textSecondary} />
                    <Text style={{ fontSize: 14, color: c.textSecondary, marginLeft: 8 }}>{showOrderDetail.time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: s.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                      <Ionicons name={s.icon} size={14} color={s.text} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: s.text }}> {showOrderDetail.status}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: c.cardAlt, borderRadius: 14, padding: 14, marginBottom: 14 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 8 }}>ITEMS</Text>
                    <Text style={{ fontSize: 14, color: c.text, lineHeight: 22 }}>{(showOrderDetail as any).items}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, color: c.textSecondary }}>Total Amount</Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: c.accent }}>{(showOrderDetail as any).amount}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowOrderDetail(null)} style={{ borderRadius: 14, overflow: 'hidden' }}>
                    <LinearGradient colors={[c.accent, c.accentDark]} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Close</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

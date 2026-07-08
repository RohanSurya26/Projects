import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput,
  FlatList, Dimensions, Modal, Alert, Animated,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

const menuItems = [
  { id: '1', name: 'Chicken Biryani', price: 1204, icon: 'flame' as IconName, cat: 'Main Course' },
  { id: '2', name: 'Paneer Tikka', price: 879, icon: 'restaurant' as IconName, cat: 'Starters' },
  { id: '3', name: 'Classic Burger', price: 996, icon: 'fast-food' as IconName, cat: 'Fast Food' },
  { id: '4', name: 'Margherita Pizza', price: 1245, icon: 'pizza' as IconName, cat: 'Fast Food' },
  { id: '5', name: 'Caesar Salad', price: 830, icon: 'leaf' as IconName, cat: 'Starters' },
  { id: '6', name: 'Pasta Alfredo', price: 1079, icon: 'restaurant' as IconName, cat: 'Main Course' },
  { id: '7', name: 'Cappuccino', price: 374, icon: 'cafe' as IconName, cat: 'Beverages' },
  { id: '8', name: 'Mojito', price: 664, icon: 'wine' as IconName, cat: 'Beverages' },
  { id: '9', name: 'Grilled Salmon', price: 1826, icon: 'fish' as IconName, cat: 'Main Course' },
  { id: '10', name: 'Fresh Lime Soda', price: 199, icon: 'water' as IconName, cat: 'Beverages' },
];

type CartItem = { id: string; name: string; price: number; qty: number };
type OrderType = 'Dine In' | 'Takeaway' | 'Room Service';

export default function BillingScreen() {
  const { colors: c } = useTheme();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('Dine In');
  const [tableNum, setTableNum] = useState('A2');
  const [discountPct, setDiscountPct] = useState(0);
  const [customerNote, setCustomerNote] = useState('');
  const [lastOrderId, setLastOrderId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<{ id: string; time: string; total: string; items: number; type: OrderType }[]>([]);

  const tabs = ['All', 'Main Course', 'Fast Food', 'Starters', 'Beverages'];

  const filtered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || item.cat === activeTab;
    return matchSearch && matchTab;
  });

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) return prev.map(ci => ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(ci => ci.id === id ? { ...ci, qty: Math.max(0, ci.qty + delta) } : ci).filter(ci => ci.qty > 0));
  };

  const totalItems = cart.reduce((s, ci) => s + ci.qty, 0);
  const subtotal = cart.reduce((s, ci) => s + ci.price * ci.qty, 0);
  const discount = Math.round(subtotal * discountPct / 100);
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * 0.05);
  const total = taxable + gst;

  const handlePay = () => {
    if (!paymentMethod) { Alert.alert('Select Payment', 'Please select a payment method'); return; }
    const oid = '#' + (1047 + orderHistory.length);
    setLastOrderId(oid);
    setOrderHistory(prev => [...prev, {
      id: oid,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: `₹${total.toLocaleString()}`,
      items: totalItems,
      type: orderType,
    }]);
    setShowCheckout(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setPaymentMethod('');
      setDiscountPct(0);
      setCustomerNote('');
    }, 2500);
  };

  const payMethods: { id: string; label: string; icon: IconName; sub: string }[] = [
    { id: 'upi', label: 'UPI', icon: 'qr-code', sub: 'Google Pay, PhonePe' },
    { id: 'card', label: 'Card', icon: 'card', sub: 'Credit / Debit Card' },
    { id: 'cash', label: 'Cash', icon: 'cash', sub: 'Pay at counter' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: c.text }}>Billing</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowHistory(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: c.border }}>
              <Ionicons name="time-outline" size={20} color={c.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => cart.length > 0 && setShowCheckout(true)}>
              <View>
                <Ionicons name="cart" size={24} color={c.textSecondary} />
                {totalItems > 0 && (
                  <View style={{ position: 'absolute', top: -6, right: -8, backgroundColor: c.accent, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{totalItems}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Type Selector */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 10 }}>
          {(['Dine In', 'Takeaway', 'Room Service'] as OrderType[]).map(type => (
            <TouchableOpacity key={type} onPress={() => setOrderType(type)} style={{
              flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
              backgroundColor: orderType === type ? c.accent : c.card,
              marginRight: type !== 'Room Service' ? 8 : 0,
              borderWidth: 1, borderColor: orderType === type ? c.accent : c.border,
            }}>
              <Ionicons name={type === 'Dine In' ? 'restaurant' : type === 'Takeaway' ? 'bag-handle' : 'bed'} size={16} color={orderType === type ? '#fff' : c.textSecondary} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: orderType === type ? '#fff' : c.textSecondary, marginTop: 4 }}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Table/Room Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: c.border }}>
            <Ionicons name={orderType === 'Room Service' ? 'bed' : 'location'} size={16} color={c.accent} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: c.text, padding: 0 }}
              value={tableNum}
              onChangeText={setTableNum}
              placeholder={orderType === 'Room Service' ? 'Room number' : 'Table number'}
              placeholderTextColor={c.textMuted}
            />
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput style={{ flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 14, color: c.text }} placeholder="Search menu items..." placeholderTextColor={c.textMuted} value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <View style={{ height: 38, marginBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
            {tabs.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginRight: 8,
                backgroundColor: activeTab === tab ? c.accent : c.card,
                borderWidth: 1, borderColor: activeTab === tab ? c.accent : c.border,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: activeTab === tab ? '#fff' : c.textSecondary }}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Grid */}
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: totalItems > 0 ? 110 : 20 }}
          columnWrapperStyle={{ marginBottom: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const inCart = cart.find(ci => ci.id === item.id);
            return (
              <TouchableOpacity
                style={{
                  width: CARD_W, backgroundColor: c.card, borderRadius: 16, padding: 14,
                  borderWidth: 1, borderColor: inCart ? c.accent + '50' : c.border,
                  marginRight: index % 2 === 0 ? 12 : 0,
                }}
                onPress={() => addToCart(item)} activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.accent + '12', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name={item.icon} size={20} color={c.accent} />
                  </View>
                  {inCart ? (
                    <View style={{ backgroundColor: c.accent, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{inCart.qty}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 2 }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ fontSize: 10, color: c.textMuted, marginBottom: 6 }}>{item.cat}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: c.accent }}>₹{item.price}</Text>
                  {inCart ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: c.danger + '15', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="remove" size={12} color={c.danger} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => addToCart(item)} style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: c.accent + '15', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                        <Ionicons name="add" size={12} color={c.accent} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => addToCart(item)} style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: c.accent + '12', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="add" size={14} color={c.accent} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Cart Bottom Bar */}
        {totalItems > 0 && (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.border, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 22 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 12, color: c.textSecondary, fontWeight: '500' }}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'} • {orderType}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginTop: 2 }}>₹{total.toLocaleString()}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setShowCheckout(true)}>
                <LinearGradient colors={[c.accent, c.accentDark]} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginRight: 6 }}>Checkout</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========== CHECKOUT MODAL ========== */}
        <Modal visible={showCheckout} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' }}>
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.textMuted }} />
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Checkout</Text>
                  <TouchableOpacity onPress={() => setShowCheckout(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.border }}>
                    <Ionicons name="close" size={18} color={c.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Order Info */}
                <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={orderType === 'Dine In' ? 'restaurant' : orderType === 'Takeaway' ? 'bag-handle' : 'bed'} size={18} color={c.accent} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{orderType}</Text>
                        <Text style={{ fontSize: 12, color: c.textSecondary }}>{orderType === 'Room Service' ? 'Room' : 'Table'} {tableNum}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: c.textSecondary }}>#{1047 + orderHistory.length}</Text>
                      <Text style={{ fontSize: 11, color: c.textMuted }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                </View>

                {/* Cart Items */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>ORDER ITEMS ({totalItems})</Text>
                <View style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden', marginBottom: 16 }}>
                  {cart.map((item, idx) => (
                    <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: idx < cart.length - 1 ? 1 : 0, borderBottomColor: c.border }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>₹{item.price} × {item.qty}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                        <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: c.cardAlt, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="remove" size={12} color={c.textSecondary} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, marginHorizontal: 8 }}>{item.qty}</Text>
                        <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: c.cardAlt, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="add" size={12} color={c.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, minWidth: 56, textAlign: 'right' }}>₹{(item.price * item.qty).toLocaleString()}</Text>
                    </View>
                  ))}
                </View>

                {/* Discount Row */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>DISCOUNT</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  {[0, 5, 10, 15, 20].map(d => (
                    <TouchableOpacity key={d} onPress={() => setDiscountPct(d)} style={{
                      flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                      backgroundColor: discountPct === d ? c.accent : c.card,
                      marginRight: d !== 20 ? 6 : 0, borderWidth: 1,
                      borderColor: discountPct === d ? c.accent : c.border,
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: discountPct === d ? '#fff' : c.textSecondary }}>{d === 0 ? 'None' : `${d}%`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Special Instructions */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>SPECIAL INSTRUCTIONS</Text>
                <View style={{ backgroundColor: c.card, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                  <TextInput
                    style={{ paddingVertical: 12, fontSize: 14, color: c.text, minHeight: 50, textAlignVertical: 'top' }}
                    placeholder="E.g. No onions, extra spicy..."
                    placeholderTextColor={c.textMuted}
                    value={customerNote}
                    onChangeText={setCustomerNote}
                    multiline
                  />
                </View>

                {/* Bill Summary */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>BILL SUMMARY</Text>
                <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: c.textSecondary }}>Subtotal</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>₹{subtotal.toLocaleString()}</Text>
                  </View>
                  {discount > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, color: c.success }}>Discount ({discountPct}%)</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.success }}>-₹{discount.toLocaleString()}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: c.textSecondary }}>GST (5%)</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>₹{gst.toLocaleString()}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: c.border, marginVertical: 8 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>Grand Total</Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: c.accent }}>₹{total.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Payment Methods */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>PAYMENT METHOD</Text>
                {payMethods.map(pm => (
                  <TouchableOpacity key={pm.id} onPress={() => setPaymentMethod(pm.id)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: paymentMethod === pm.id ? c.accent : c.border }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: paymentMethod === pm.id ? c.accent + '18' : c.cardAlt, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Ionicons name={pm.icon} size={18} color={paymentMethod === pm.id ? c.accent : c.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{pm.label}</Text>
                      <Text style={{ fontSize: 11, color: c.textSecondary }}>{pm.sub}</Text>
                    </View>
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: paymentMethod === pm.id ? c.accent : c.border, justifyContent: 'center', alignItems: 'center' }}>
                      {paymentMethod === pm.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.accent }} />}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Pay Button */}
                <TouchableOpacity onPress={handlePay} activeOpacity={0.85} style={{ marginTop: 10, borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient colors={[c.accent, c.accentDark]} style={{ paddingVertical: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>Pay ₹{total.toLocaleString()}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ========== SUCCESS MODAL ========== */}
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            <View style={{ backgroundColor: c.card, borderRadius: 28, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: c.border, width: '100%' }}>
              <LinearGradient colors={[c.success, '#059669']} style={{ width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                <Ionicons name="checkmark" size={36} color="#fff" />
              </LinearGradient>
              <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 6 }}>Payment Successful!</Text>
              <Text style={{ fontSize: 14, color: c.textSecondary, textAlign: 'center', marginBottom: 4 }}>Order {lastOrderId} placed</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: c.accent }}>₹{total.toLocaleString()}</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>{orderType} • {orderType === 'Room Service' ? 'Room' : 'Table'} {tableNum}</Text>
            </View>
          </View>
        </Modal>

        {/* ========== ORDER HISTORY MODAL ========== */}
        <Modal visible={showHistory} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' }}>
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.textMuted }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>Order History</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: c.border }}>
                  <Ionicons name="close" size={18} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {orderHistory.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Ionicons name="receipt-outline" size={48} color={c.textMuted} />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: c.textSecondary, marginTop: 12 }}>No orders yet</Text>
                    <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>Completed orders will appear here</Text>
                  </View>
                ) : (
                  orderHistory.slice().reverse().map((order, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: c.border }}>
                      <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: c.success + '18', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                        <Ionicons name="checkmark-circle" size={20} color={c.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Order {order.id}</Text>
                        <Text style={{ fontSize: 12, color: c.textSecondary }}>{order.items} items • {order.type} • {order.time}</Text>
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: c.accent }}>{order.total}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

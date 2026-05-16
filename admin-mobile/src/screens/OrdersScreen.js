import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { ordersApi } from '../lib/api'
import { COLORS } from '../config'

const STATUSES = ['pending','confirmed','shipped','completed','cancelled']
const STATUS_COLORS = {
  pending:   { color:'#d97706', bg:'#fef3c7' },
  confirmed: { color:'#2563eb', bg:'#dbeafe' },
  shipped:   { color:'#7c3aed', bg:'#ede9fe' },
  completed: { color:'#16a34a', bg:'#dcfce7' },
  cancelled: { color:'#dc2626', bg:'#fee2e2' },
}

export default function OrdersScreen() {
  const [data,    setData]    = useState({ orders:[], total:0 })
  const [filter,  setFilter]  = useState('')
  const [refresh, setRefresh] = useState(false)
  const [expanded,setExpanded]= useState(null)
  const insets = useSafeAreaInsets()

  const load = async (r=false) => {
    if (r) setRefresh(true)
    try { setData(await ordersApi.getAll({ status: filter, limit: 100 })) }
    catch (e) { console.error(e) }
    finally { setRefresh(false) }
  }
  useEffect(() => { load() }, [filter])

  const changeStatus = async (id, status) => {
    try { await ordersApi.updateStatus(id, status); load() }
    catch (e) { Alert.alert('Error', 'Could not update status') }
  }

  const renderOrder = ({ item: o }) => {
    const st = STATUS_COLORS[o.status] || { color:'#888', bg:'#f5f5f5' }
    const isExpanded = expanded === o._id
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : o._id)} style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardTop}>
              <Text style={styles.customerName}>{o.customer.name}</Text>
              <View style={[styles.pill, { backgroundColor: st.bg }]}>
                <Text style={[styles.pillText, { color: st.color }]}>{o.status}</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>{o.customer.phone} · {new Date(o.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.total}>{(+o.total).toFixed(2)} TND</Text>
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#bbb"/>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expansion}>
            <Text style={styles.expLabel}>Address</Text>
            <Text style={styles.expValue}>{o.customer.address}</Text>
            {o.customer.email ? <><Text style={styles.expLabel}>Email</Text><Text style={styles.expValue}>{o.customer.email}</Text></> : null}
            <Text style={[styles.expLabel, { marginTop: 10 }]}>Items</Text>
            {o.items?.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>×{item.qty}</Text>
                <Text style={styles.itemPrice}>{(+item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.statusChange}>
              <Text style={styles.expLabel}>Change status</Text>
              <View style={styles.statusBtns}>
                {STATUSES.map(s => (
                  <TouchableOpacity key={s} onPress={() => changeStatus(o._id, s)}
                    style={[styles.statusBtn, o.status === s && { backgroundColor: COLORS.primary }]}>
                    <Text style={[styles.statusBtnText, o.status === s && { color: COLORS.secondary }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders ({data.total})</Text>
      </View>
      <View style={styles.filterRow}>
        {['','pending','confirmed','shipped','completed','cancelled'].map(s => (
          <TouchableOpacity key={s} onPress={() => setFilter(s)}
            style={[styles.filterBtn, filter === s && { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.filterText, filter === s && { color: COLORS.secondary }]}>{s || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={data.orders} keyExtractor={o => o._id} renderItem={renderOrder}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f7f7f7' },
  header:       { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  filterRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12 },
  filterBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#eee' },
  filterText:   { fontSize: 12, fontWeight: '500', color: '#555' },
  card:         { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 0.5, borderColor: '#eee' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  customerName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  pill:         { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pillText:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  cardSub:      { fontSize: 12, color: '#aaa' },
  cardRight:    { alignItems: 'flex-end', gap: 4 },
  total:        { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  expansion:    { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 0.5, borderTopColor: '#f5f5f5', backgroundColor: '#fafafa' },
  expLabel:     { fontSize: 10, fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 3 },
  expValue:     { fontSize: 13, color: '#555' },
  itemRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  itemName:     { flex: 1, fontSize: 13, color: '#1a1a1a' },
  itemQty:      { fontSize: 12, color: '#888', marginHorizontal: 8 },
  itemPrice:    { fontSize: 13, fontWeight: '600' },
  statusChange: { marginTop: 12 },
  statusBtns:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  statusBtn:    { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f5f5f5' },
  statusBtnText:{ fontSize: 12, fontWeight: '500', color: '#555' },
  empty:        { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
})

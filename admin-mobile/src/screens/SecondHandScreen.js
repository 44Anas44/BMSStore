import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { productsApi } from '../lib/api'
import { COLORS } from '../config'

export default function SecondHandScreen() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [refresh,  setRefresh]  = useState(false)
  const [search,   setSearch]   = useState('')
  const insets = useSafeAreaInsets()

  const load = useCallback(async (r = false) => {
    if (r) setRefresh(true); else setLoading(true)
    try {
      const data = await productsApi.getAll({ limit: 200, all: 'true' })
      setProducts((data.products || []).filter(p => p.isSecondHand))
    } catch (e) { console.error(e) }
    finally { setLoading(false); setRefresh(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const toggleSecondHand = async (p) => {
    Alert.alert(
      p.isSecondHand ? 'Remove from Second Hand' : 'Mark as Second Hand',
      `\${p.isSecondHand ? 'Remove' : 'Mark'} "\${p.name}" \\\${p.isSecondHand ? 'from the second-hand page?' : 'as second-hand?'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: async () => {
          try {
            await productsApi.update(p._id, {
              ...p,
              isSecondHand: !p.isSecondHand,
              category: p.category?._id || p.category,
              brand: p.brand?._id || p.brand,
            })
            load()
          } catch (e) { Alert.alert('Error', 'Could not update product') }
        }},
      ]
    )
  }

  const filtered = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  const renderItem = ({ item: p }) => (
    <View style={s.card}>
      <View style={s.cardBody}>
        <Text style={s.name} numberOfLines={1}>{p.name}</Text>
        <Text style={s.price}>{(+p.price).toFixed(2)} TND</Text>
        <Text style={s.meta}>Stock: {p.stock} · {p.brand?.name || 'No brand'}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleSecondHand(p)} style={s.removeBtn}>
        <Feather name="x-circle" size={18} color={COLORS.danger}/>
        <Text style={s.removeTxt}>Remove</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Second Hand ({products.length})</Text>
      </View>
      <View style={s.searchRow}>
        <Feather name="search" size={15} color="#aaa" style={{ marginRight: 8 }}/>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search second-hand products..."
          placeholderTextColor="#bbb"
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={15} color="#aaa"/></TouchableOpacity> : null}
      </View>
      <View style={s.hint}>
        <Feather name="info" size={12} color="#d97706"/>
        <Text style={s.hintText}>To add second-hand products, go to Products → Edit → enable Second Hand flag</Text>
      </View>
      {loading ? (
        <Text style={s.empty}>Loading...</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
          ListEmptyComponent={<Text style={s.empty}>{search ? 'No results' : 'No second-hand products yet'}</Text>}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f7f7f7' },
  header:      { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  searchRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 0.5, borderColor: '#eee' },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  hint:        { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fffbeb', padding: 10, borderRadius: 8 },
  hintText:    { flex: 1, fontSize: 12, color: '#d97706', lineHeight: 16 },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#eee' },
  cardBody:    { flex: 1 },
  name:        { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  price:       { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  meta:        { fontSize: 12, color: '#aaa' },
  removeBtn:   { alignItems: 'center', gap: 3, paddingLeft: 12 },
  removeTxt:   { fontSize: 11, color: COLORS.danger, fontWeight: '600' },
  empty:       { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
})

import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, RefreshControl, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { productsApi } from '../lib/api'
import { COLORS } from '../config'

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([])
  const [search,   setSearch]   = useState('')
  const [refresh,  setRefresh]  = useState(false)
  const insets = useSafeAreaInsets()

  const load = useCallback(async (r=false) => {
    if (r) setRefresh(true)
    try {
      const d = await productsApi.getAll({ limit: 200, all: 'true' })
      setProducts(d.products || [])
    } catch (e) { console.error(e) }
    finally { setRefresh(false) }
  }, [])

  useEffect(() => {
    load()
    const unsub = navigation.addListener('focus', () => load())
    return unsub
  }, [navigation, load])

  const del = (id, name) => {
    Alert.alert('Delete product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await productsApi.delete(id); load() } },
    ])
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const TagPill = ({ label, color, bg }) => (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products ({products.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ProductForm', { product: null })}>
          <Feather name="plus" size={18} color={COLORS.secondary}/>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color="#bbb" style={{ marginRight: 8 }}/>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search products..."
          placeholderTextColor="#bbb" style={styles.searchInput}/>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => p._id}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>{products.length === 0 ? 'No products yet' : 'No results'}</Text>}
        renderItem={({ item: p }) => (
          <View style={styles.card}>
            <Image source={{ uri: p.images?.[0] || 'https://placehold.co/56x56/f5f5f5/ccc?text=?' }}
              style={styles.img}/>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.price}>{(+p.price).toFixed(2)} TND
                {p.comparePrice > p.price && <Text style={styles.compare}>  {(+p.comparePrice).toFixed(2)}</Text>}
              </Text>
              <View style={styles.tagRow}>
                {p.isPromo      && <TagPill label="PROMO" color="#ef4444" bg="#fef2f2"/>}
                {p.isFeatured   && <TagPill label="FEAT"  color="#8b5cf6" bg="#f5f3ff"/>}
                {p.isNewArrival && <TagPill label="NEW"   color="#22c55e" bg="#f0fdf4"/>}
                <Text style={styles.stock}>Stock: {p.stock}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate('ProductForm', { product: p })} style={styles.editBtn}>
                <Feather name="edit-2" size={15} color="#555"/>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => del(p._id, p.name)} style={styles.delBtn}>
                <Feather name="trash-2" size={15} color="#ef4444"/>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f7f7f7' },
  header:     { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle:{ fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  addBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.secondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  searchRow:  { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 0.5, borderColor: '#eee' },
  searchInput:{ flex: 1, fontSize: 14, color: '#1a1a1a' },
  card:       { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 0.5, borderColor: '#eee' },
  img:        { width: 56, height: 56, borderRadius: 8, backgroundColor: '#f5f5f5' },
  name:       { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  price:      { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  compare:    { fontSize: 12, color: '#ccc', textDecorationLine: 'line-through' },
  tagRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  tag:        { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText:    { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  stock:      { fontSize: 11, color: '#bbb', marginLeft: 'auto' },
  actions:    { gap: 8, marginLeft: 8 },
  editBtn:    { width: 34, height: 34, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  delBtn:     { width: 34, height: 34, borderRadius: 8, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  empty:      { textAlign: 'center', color: '#ccc', marginTop: 60, fontSize: 14 },
})

import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BarChart } from 'react-native-chart-kit'
import { Feather } from '@expo/vector-icons'
import { adminApi, ordersApi } from '../lib/api'
import { COLORS, BRAND } from '../config'

const W = Dimensions.get('window').width

const StatCard = ({ label, value, icon, accent }) => (
  <View style={[styles.statCard, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
    <View style={[styles.statIcon, { backgroundColor: accent + '18' }]}>
      <Feather name={icon} size={20} color={accent}/>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
)

export default function DashboardScreen() {
  const [data,    setData]    = useState(null)
  const [stats,   setStats]   = useState(null)
  const [refresh, setRefresh] = useState(false)
  const insets = useSafeAreaInsets()

  const load = async (r=false) => {
    if (r) setRefresh(true)
    try {
      const [d, s] = await Promise.all([adminApi.getDashboard(), ordersApi.getStats()])
      setData(d); setStats(s)
    } catch (e) { console.error(e) }
    finally { setRefresh(false) }
  }
  useEffect(() => { load() }, [])

  const chartData = data?.orderStats?.slice(-7) || []
  const hasChart  = chartData.length > 0

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => load(true)} colors={[COLORS.primary]}/>}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{BRAND}</Text>
        <Text style={styles.headerSub}>Admin Dashboard</Text>
      </View>

      {data && (
        <View style={styles.statsGrid}>
          <StatCard label="Products"   value={data.products}  icon="package"      accent={COLORS.primary}/>
          <StatCard label="Orders"     value={data.orders}    icon="shopping-bag" accent={COLORS.info}/>
          <StatCard label="Revenue"    value={(stats?.revenue || 0).toFixed(0) + ' TND'} icon="trending-up" accent={COLORS.success}/>
          <StatCard label="Pending"    value={data.orderStats?.filter ? (stats?.byStatus?.find(s=>s._id==='pending')?.count || 0) : '—'} icon="clock" accent={COLORS.warning}/>
        </View>
      )}

      {hasChart && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders — last 7 days</Text>
          <BarChart
            data={{ labels: chartData.map(d => d._id?.slice(5) || ''), datasets: [{ data: chartData.map(d => d.count || 0) }] }}
            width={W - 32} height={180}
            chartConfig={{ backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', color: () => COLORS.primary, labelColor: () => '#888', barPercentage: 0.6, decimalPlaces: 0 }}
            style={{ borderRadius: 12 }} fromZero/>
        </View>
      )}

      {stats?.topProducts?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best sellers</Text>
          {stats.topProducts.map((p, i) => (
            <View key={p._id} style={styles.topRow}>
              <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#fef3c7' : '#f5f5f5' }]}>
                <Text style={[styles.rankText, { color: i === 0 ? '#d97706' : '#888' }]}>#{i+1}</Text>
              </View>
              <Text style={styles.topName} numberOfLines={1}>{p.name || 'Unknown'}</Text>
              <Text style={styles.topSold}>{p.sold} sold</Text>
              <Text style={styles.topRevenue}>{p.revenue.toFixed(0)} TND</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f7f7f7' },
  header:       { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.3 },
  headerSub:    { fontSize: 13, color: COLORS.secondary, opacity: 0.6, marginTop: 2 },
  statsGrid:    { padding: 16, gap: 10 },
  statCard:     { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  statIcon:     { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statLabel:    { fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue:    { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },
  section:      { backgroundColor: '#fff', margin: 16, marginTop: 0, borderRadius: 14, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  topRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  rankBadge:    { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rankText:     { fontSize: 11, fontWeight: '700' },
  topName:      { flex: 1, fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  topSold:      { fontSize: 12, color: '#888' },
  topRevenue:   { fontSize: 13, fontWeight: '700', color: COLORS.success, minWidth: 60, textAlign: 'right' },
})

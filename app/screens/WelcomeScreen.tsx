import { FC, useMemo, useState } from "react"
import { Pressable, SafeAreaView, ScrollView, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"

type ScreenKey = "home" | "port" | "adv" | "info"
type PortfolioKey = "all" | "ppli" | "lie" | "direct"
type Currency = "CHF" | "USD" | "EUR" | "HKD" | "SGD"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

type Holding = {
  id: string
  name: string
  pct: string
  subs: Array<{ n: string; v: number }>
  val: number
}

type PortfolioData = {
  entity: string | null
  holdings: Holding[]
  label: string
  total: number
}

const rates: Record<Currency, number> = {
  CHF: 1,
  USD: 1.12,
  EUR: 1.02,
  HKD: 8.76,
  SGD: 1.52,
}

const portfolioData: Record<PortfolioKey, PortfolioData> = {
  all: {
    total: 67055478,
    label: "All structures",
    entity: null,
    holdings: [
      {
        id: "alt",
        name: "Alternatives",
        val: 32003982,
        pct: "47.7%",
        subs: [
          { n: "Aeolus Wind Fund III", v: 18200000 },
          { n: "PE Asia Growth", v: 8600000 },
          { n: "Real Assets LP", v: 5203982 },
        ],
      },
      {
        id: "eq",
        name: "Equities",
        val: 21167556,
        pct: "31.6%",
        subs: [
          { n: "Global Equity Basket", v: 12400000 },
          { n: "US Tech ETF", v: 5767556 },
          { n: "EM Markets", v: 3000000 },
        ],
      },
      {
        id: "hld",
        name: "Crypto",
        val: 7446678,
        pct: "11.1%",
        subs: [
          { n: "BTC (3.2 BTC)", v: 4446678 },
          { n: "ETH (12 ETH)", v: 3000000 },
        ],
      },
      {
        id: "csh",
        name: "Cash",
        val: 2218513,
        pct: "3.3%",
        subs: [
          { n: "UBS CHF", v: 1200000 },
          { n: "JB EUR", v: 918513 },
          { n: "Sygnum USD", v: 100000 },
        ],
      },
      {
        id: "fi",
        name: "Fixed income",
        val: 345661,
        pct: "0.5%",
        subs: [{ n: "Swiss Govt Bond 2028", v: 345661 }],
      },
    ],
  },
  ppli: {
    total: 47849643,
    label: "Oliver Berger PPLI · Zurich Life",
    entity: "Policy #LI-2021-4491",
    holdings: [
      {
        id: "alt",
        name: "Alternatives",
        val: 32003982,
        pct: "66.9%",
        subs: [
          { n: "Aeolus Wind Fund III", v: 18200000 },
          { n: "PE Asia Growth", v: 8600000 },
          { n: "Real Assets LP", v: 5203982 },
        ],
      },
      {
        id: "eq",
        name: "Equities",
        val: 15000000,
        pct: "31.3%",
        subs: [
          { n: "Global Equity Basket", v: 12400000 },
          { n: "US Tech ETF", v: 2600000 },
        ],
      },
      {
        id: "fi",
        name: "Fixed income",
        val: 345661,
        pct: "0.7%",
        subs: [{ n: "Swiss Govt Bond 2028", v: 345661 }],
      },
      {
        id: "csh",
        name: "Cash",
        val: 500000,
        pct: "1.0%",
        subs: [{ n: "Policy cash account", v: 500000 }],
      },
    ],
  },
  lie: {
    total: 7386069,
    label: "OB Family Foundation · Liechtenstein",
    entity: "Est. 2019 · LGT Trustee",
    holdings: [
      {
        id: "eq",
        name: "Equities",
        val: 6167556,
        pct: "83.5%",
        subs: [
          { n: "US Tech ETF", v: 3167556 },
          { n: "EM Markets", v: 3000000 },
        ],
      },
      {
        id: "csh",
        name: "Cash",
        val: 1218513,
        pct: "16.5%",
        subs: [
          { n: "UBS CHF", v: 700000 },
          { n: "JB EUR", v: 518513 },
        ],
      },
    ],
  },
  direct: {
    total: 11819766,
    label: "Direct holdings",
    entity: "Personal · APA accounts",
    holdings: [
      {
        id: "hld",
        name: "Crypto",
        val: 7446678,
        pct: "63.0%",
        subs: [
          { n: "BTC (3.2 BTC)", v: 4446678 },
          { n: "ETH (12 ETH)", v: 3000000 },
        ],
      },
      {
        id: "csh",
        name: "Cash · APA",
        val: 2873088,
        pct: "24.3%",
        subs: [
          { n: "CHF current **** 4821", v: 1673088 },
          { n: "USD account **** 7203", v: 1200000 },
        ],
      },
      {
        id: "eq",
        name: "Equities",
        val: 1500000,
        pct: "12.7%",
        subs: [{ n: "Global Equity (direct)", v: 1500000 }],
      },
    ],
  },
}

const topbars: Record<ScreenKey, { sub: string; title: string }> = {
  home: { title: "Good morning, Oliver", sub: "Saturday, 30 May 2026" },
  port: { title: "Portfolio", sub: "Live data · Qplix" },
  adv: { title: "Advisory", sub: "" },
  info: { title: "My Info", sub: "Oliver Berger" },
}

const navItems: Array<{ icon: string; key: ScreenKey; label: string }> = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "port", label: "Portfolio", icon: "◫" },
  { key: "adv", label: "Advisory", icon: "✉" },
  { key: "info", label: "My Info", icon: "◎" },
]

const filterLabels: Record<PortfolioKey, string> = {
  all: "All",
  ppli: "PPLI",
  lie: "LIE",
  direct: "Direct",
}

const currencyLabels: Record<Currency, string> = {
  CHF: "Swiss Franc",
  USD: "US Dollar",
  EUR: "Euro",
  HKD: "Hong Kong Dollar",
  SGD: "Singapore Dollar",
}

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen() {
  const [screen, setScreen] = useState<ScreenKey>("home")
  const [currency, setCurrency] = useState<Currency>("CHF")
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioKey>("all")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [notifications, setNotifications] = useState({
    actions: true,
    messages: true,
    portfolio: false,
  })

  const activeTopbar = topbars[screen]
  const activePortfolio = portfolioData[portfolioFilter]

  const money = useMemo(() => {
    const fmt = (value: number) => Math.round(value * rates[currency]).toLocaleString("en-US")
    const fmtM = (value: number) => `${((value * rates[currency]) / 1e6).toFixed(1)}M`

    return { fmt, fmtM }
  }, [currency])

  function toggleHolding(id: string) {
    setExpanded((current) => ({
      ...current,
      [`${portfolioFilter}-${id}`]: !current[`${portfolioFilter}-${id}`],
    }))
  }

  return (
    <SafeAreaView style={$page}>
      <View style={$pageLabel}>
        <Text style={$labelText}>BFCH · Kaiya</Text>
        <Text style={$pageTitle}>Interactive app mockup</Text>
        <Text style={$pageSub}>Phase 1 MVP — tap through the screens</Text>
      </View>

      <View style={$phone}>
        <View style={$statusbar}>
          <Text style={$statusText}>9:41</Text>
          <Text style={$statusText}>●●●</Text>
        </View>

        <View style={$topbar}>
          <View>
            <Text style={$topbarTitle}>{activeTopbar.title}</Text>
            {activeTopbar.sub ? <Text style={$topbarSub}>{activeTopbar.sub}</Text> : null}
          </View>
          <View style={$avatar}>
            <Text style={$avatarText}>OB</Text>
          </View>
        </View>

        <ScrollView
          style={$screen}
          contentContainerStyle={$screenContent}
          showsVerticalScrollIndicator={false}
        >
          {screen === "home" ? <HomeScreen currency={currency} money={money} /> : null}
          {screen === "port" ? (
            <PortfolioScreen
              currency={currency}
              data={activePortfolio}
              expanded={expanded}
              filter={portfolioFilter}
              money={money}
              onFilter={setPortfolioFilter}
              onToggleHolding={toggleHolding}
            />
          ) : null}
          {screen === "adv" ? <AdvisoryScreen /> : null}
          {screen === "info" ? (
            <InfoScreen
              currency={currency}
              notifications={notifications}
              onCurrency={setCurrency}
              onToggleNotification={(key) =>
                setNotifications((current) => ({ ...current, [key]: !current[key] }))
              }
            />
          ) : null}
        </ScrollView>

        <View style={$navbar}>
          {navItems.map((item) => {
            const active = screen === item.key

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={item.key}
                onPress={() => setScreen(item.key)}
                style={$navTab}
              >
                <Text style={[$navIcon, active && $navActive]}>{item.icon}</Text>
                <Text style={[$navText, active && $navActive]}>{item.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </SafeAreaView>
  )
}

function HomeScreen({
  currency,
  money,
}: {
  currency: Currency
  money: { fmt: (value: number) => string; fmtM: (value: number) => string }
}) {
  return (
    <>
      <SectionTitle>Open tasks</SectionTitle>
      <View style={[$card, $cardSmall]}>
        <Row
          badge="Action"
          badgeStyle={$badgeAction}
          label="BTC → PPLI conversion"
          sub="Approve transfer docs"
        />
        <Row
          badge="Pending"
          badgeStyle={$badgePending}
          label="KYC renewal"
          sub="Upload updated passport"
        />
        <Row
          badge="Due soon"
          badgeStyle={$badgePending}
          label="LIE Foundation annual review"
          sub="Due Jun 15"
        />
      </View>

      <SectionTitle>Recent documents</SectionTitle>
      <View style={[$card, $cardSmall]}>
        <Row accessory="⇩" label="Q1 2026 Portfolio Report" sub="PDF · 2.1 MB · 28 May" />
        <Row accessory="⇩" label="PPLI Policy Statement" sub="PDF · 890 KB · 14 May" />
      </View>

      <SectionTitle>Total wealth</SectionTitle>
      <View style={$totalCard}>
        <Text style={$totalMeta}>{currency} · All structures</Text>
        <Text style={$totalValue}>
          {currency} {money.fmtM(67055478)}
        </Text>
        <Text style={$totalMeta}>↑ +2.3% YTD · Last updated: today</Text>
      </View>
    </>
  )
}

function PortfolioScreen({
  currency,
  data,
  expanded,
  filter,
  money,
  onFilter,
  onToggleHolding,
}: {
  currency: Currency
  data: PortfolioData
  expanded: Record<string, boolean>
  filter: PortfolioKey
  money: { fmt: (value: number) => string; fmtM: (value: number) => string }
  onFilter: (filter: PortfolioKey) => void
  onToggleHolding: (id: string) => void
}) {
  return (
    <>
      <ScrollView
        horizontal
        contentContainerStyle={$filterBar}
        showsHorizontalScrollIndicator={false}
        style={$filterScroll}
      >
        {(Object.keys(filterLabels) as PortfolioKey[]).map((key) => (
          <Pressable
            accessibilityRole="button"
            key={key}
            onPress={() => onFilter(key)}
            style={[$filterPill, filter === key && $filterPillActive]}
          >
            <Text style={[$filterText, filter === key && $filterTextActive]}>
              {filterLabels[key]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {data.entity ? <Text style={$entityText}>{data.entity}</Text> : null}

      <View style={[$card, $portfolioHeader]}>
        <Text style={$smallLabel}>{data.label}</Text>
        <Text style={$value}>
          {currency} {money.fmtM(data.total)}
        </Text>
      </View>

      <View style={$holdingList}>
        {data.holdings.map((holding) => {
          const isOpen = !!expanded[`${filter}-${holding.id}`]

          return (
            <View key={holding.id}>
              <Pressable onPress={() => onToggleHolding(holding.id)} style={$expandRow}>
                <View style={$holdingNameWrap}>
                  <Text style={$tagLabel}>{holding.name}</Text>
                  <Text style={$arrow}>{isOpen ? "▼" : "▶"}</Text>
                </View>
                <View style={$rightValue}>
                  <Text style={$valueSmall}>
                    {currency} {money.fmt(holding.val)}
                  </Text>
                  <Text style={$percent}>{holding.pct}</Text>
                </View>
              </Pressable>
              {isOpen ? (
                <View style={$expandedPanel}>
                  {holding.subs.map((sub) => (
                    <View key={sub.n} style={$subRow}>
                      <Text style={$subText}>{sub.n}</Text>
                      <Text style={$subText}>
                        {currency} {money.fmt(sub.v)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )
        })}
      </View>
    </>
  )
}

function AdvisoryScreen() {
  const workflow = [
    ["Sell BTC at Sygnum", "Done"],
    ["FX to CHF", "Done"],
    ["Wire to APA", "In progress"],
    ["Subscribe into PPLI", "Pending"],
  ] as const

  return (
    <>
      <SectionTitle>Messages</SectionTitle>
      <View style={[$card, $cardSmall]}>
        <Row
          accessory="ⓘ"
          accessoryStyle={$infoIcon}
          label="Sarah M. — Relationship Manager"
          sub="BTC workflow update — 29 May"
        />
        <Row label="BFCH Team" sub="Q1 review call — 14 May" />
      </View>

      <SectionTitle>BTC → PPLI workflow</SectionTitle>
      <View style={[$card, $cardSmall]}>
        {workflow.map(([label, status], index) => {
          const done = status === "Done"
          const progress = status === "In progress"

          return (
            <View key={label} style={[$workflowRow, index < workflow.length - 1 && $rowBorder]}>
              <View style={[$workflowDot, done && $workflowDone, progress && $workflowProgress]}>
                <Text style={$workflowDotText}>{done ? "✓" : progress ? "…" : ""}</Text>
              </View>
              <View>
                <Text style={$tagLabelSmall}>{label}</Text>
                <Text style={$tagSub}>{status}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </>
  )
}

function InfoScreen({
  currency,
  notifications,
  onCurrency,
  onToggleNotification,
}: {
  currency: Currency
  notifications: { actions: boolean; messages: boolean; portfolio: boolean }
  onCurrency: (currency: Currency) => void
  onToggleNotification: (key: keyof typeof notifications) => void
}) {
  return (
    <>
      <View style={$profileCard}>
        <View style={$profileAvatar}>
          <Text style={$profileAvatarText}>OB</Text>
        </View>
        <View>
          <Text style={$profileName}>Oliver Berger</Text>
          <Text style={$tagSub}>Client since 2018 · HNWI</Text>
        </View>
      </View>

      <SectionTitle>Display currency</SectionTitle>
      <View style={[$card, $cardSmall]}>
        {(Object.keys(currencyLabels) as Currency[]).map((key) => (
          <Pressable key={key} onPress={() => onCurrency(key)} style={$currencyRow}>
            <View>
              <Text style={$tagLabelSmall}>{key}</Text>
              <Text style={$tagSub}>{currencyLabels[key]}</Text>
            </View>
            <Text style={currency === key ? $currencySelected : $currencyUnselected}>
              {currency === key ? "Selected" : "Select"}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Notifications</SectionTitle>
      <View style={[$card, $cardSmall]}>
        <ToggleRow
          enabled={notifications.actions}
          label="Tasks & actions"
          onPress={() => onToggleNotification("actions")}
        />
        <ToggleRow
          enabled={notifications.messages}
          label="New messages"
          onPress={() => onToggleNotification("messages")}
        />
        <ToggleRow
          enabled={notifications.portfolio}
          label="Portfolio updates"
          onPress={() => onToggleNotification("portfolio")}
        />
      </View>

      <SectionTitle>Contact</SectionTitle>
      <View style={[$card, $cardSmall]}>
        <Row label="Email" labelStyle={$mutedLabel} value="o.berger@email.com" />
        <Row
          badge="Renewal due"
          badgeStyle={$badgePending}
          label="KYC status"
          labelStyle={$mutedLabel}
        />
      </View>
    </>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={$sectionTitle}>{children}</Text>
}

function Row({
  accessory,
  accessoryStyle,
  badge,
  badgeStyle,
  label,
  labelStyle,
  sub,
  value,
}: {
  accessory?: string
  accessoryStyle?: TextStyle
  badge?: string
  badgeStyle?: TextStyle
  label: string
  labelStyle?: TextStyle
  sub?: string
  value?: string
}) {
  return (
    <View style={$row}>
      <View style={$rowText}>
        <Text style={[$tagLabel, labelStyle]}>{label}</Text>
        {sub ? <Text style={$tagSub}>{sub}</Text> : null}
      </View>
      {badge ? <Text style={[$badge, badgeStyle]}>{badge}</Text> : null}
      {accessory ? <Text style={[$accessory, accessoryStyle]}>{accessory}</Text> : null}
      {value ? <Text style={$rowValue}>{value}</Text> : null}
    </View>
  )
}

function ToggleRow({
  enabled,
  label,
  onPress,
}: {
  enabled: boolean
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={$row}>
      <Text style={$toggleLabel}>{label}</Text>
      <View style={[$switchTrack, enabled && $switchTrackOn]}>
        <View style={[$switchKnob, enabled && $switchKnobOn]} />
      </View>
    </Pressable>
  )
}

const navy = "#1a1a2e"
const cream = "#f0efe8"
const screenBg = "#f5f5f0"
const line = "#e8e8e0"
const muted = "#888"

const $page: ViewStyle = {
  alignItems: "center",
  backgroundColor: cream,
  flex: 1,
  paddingHorizontal: 16,
  paddingTop: 32,
}

const $pageLabel: ViewStyle = {
  alignItems: "center",
}

const $labelText: TextStyle = {
  color: "#999",
  fontSize: 11,
  fontWeight: "500",
  letterSpacing: 0.6,
  marginBottom: 8,
  textTransform: "uppercase",
}

const $pageTitle: TextStyle = {
  color: "#1a1a1a",
  fontSize: 22,
  fontWeight: "500",
  marginBottom: 4,
}

const $pageSub: TextStyle = {
  color: muted,
  fontSize: 13,
  marginBottom: 28,
}

const $phone: ViewStyle = {
  backgroundColor: "#fff",
  borderColor: "#ccc",
  borderRadius: 40,
  borderWidth: 1,
  boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
  display: "flex",
  flex: 1,
  marginBottom: 16,
  maxHeight: 640,
  maxWidth: 320,
  overflow: "hidden",
  width: "100%",
}

const $statusbar: ViewStyle = {
  backgroundColor: navy,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingBottom: 5,
  paddingHorizontal: 18,
  paddingTop: 10,
}

const $statusText: TextStyle = {
  color: "#fff",
  fontSize: 11,
}

const $topbar: ViewStyle = {
  alignItems: "center",
  backgroundColor: navy,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingVertical: 12,
}

const $topbarTitle: TextStyle = {
  color: "#fff",
  fontSize: 15,
  fontWeight: "500",
}

const $topbarSub: TextStyle = {
  color: "rgba(255,255,255,0.6)",
  fontSize: 11,
  marginTop: 1,
}

const $avatar: ViewStyle = {
  alignItems: "center",
  backgroundColor: "#3a3a6e",
  borderRadius: 15,
  height: 30,
  justifyContent: "center",
  width: 30,
}

const $avatarText: TextStyle = {
  color: "#aac",
  fontSize: 11,
  fontWeight: "500",
}

const $screen: ViewStyle = {
  backgroundColor: screenBg,
  flex: 1,
}

const $screenContent: ViewStyle = {
  paddingBottom: 8,
}

const $navbar: ViewStyle = {
  backgroundColor: navy,
  borderTopColor: "rgba(255,255,255,0.1)",
  borderTopWidth: 1,
  flexDirection: "row",
}

const $navTab: ViewStyle = {
  alignItems: "center",
  flex: 1,
  paddingBottom: 11,
  paddingTop: 7,
}

const $navIcon: TextStyle = {
  color: "rgba(255,255,255,0.35)",
  fontSize: 13,
  lineHeight: 15,
}

const $navText: TextStyle = {
  color: "rgba(255,255,255,0.35)",
  fontSize: 10,
}

const $navActive: TextStyle = {
  color: "#7eb8f7",
}

const $sectionTitle: TextStyle = {
  color: "#999",
  fontSize: 11,
  fontWeight: "500",
  letterSpacing: 0.4,
  paddingBottom: 4,
  paddingHorizontal: 16,
  paddingTop: 10,
  textTransform: "uppercase",
}

const $card: ViewStyle = {
  backgroundColor: "#fff",
  borderColor: line,
  borderRadius: 12,
  borderWidth: 1,
  marginHorizontal: 12,
  marginVertical: 8,
  padding: 14,
}

const $cardSmall: ViewStyle = {
  paddingHorizontal: 14,
  paddingVertical: 0,
}

const $row: ViewStyle = {
  alignItems: "center",
  borderBottomColor: "#f0f0e8",
  borderBottomWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  minHeight: 42,
  paddingVertical: 9,
}

const $rowText: ViewStyle = {
  flex: 1,
  paddingRight: 8,
}

const $tagLabel: TextStyle = {
  color: "#1a1a1a",
  fontSize: 13,
  fontWeight: "500",
}

const $tagLabelSmall: TextStyle = {
  color: "#1a1a1a",
  fontSize: 12,
  fontWeight: "500",
}

const $tagSub: TextStyle = {
  color: muted,
  fontSize: 11,
  marginTop: 2,
}

const $badge: TextStyle = {
  borderRadius: 4,
  fontSize: 10,
  fontWeight: "500",
  overflow: "hidden",
  paddingHorizontal: 7,
  paddingVertical: 2,
}

const $badgeAction: TextStyle = {
  backgroundColor: "#D4EDDA",
  color: "#155724",
}

const $badgePending: TextStyle = {
  backgroundColor: "#FFF3CD",
  color: "#856404",
}

const $accessory: TextStyle = {
  color: "#aaa",
  fontSize: 15,
}

const $infoIcon: TextStyle = {
  color: "#1a73e8",
}

const $rowValue: TextStyle = {
  color: "#1a1a1a",
  fontSize: 12,
}

const $totalCard: ViewStyle = {
  backgroundColor: navy,
  borderRadius: 12,
  marginHorizontal: 12,
  marginVertical: 8,
  padding: 14,
}

const $totalMeta: TextStyle = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 11,
  marginBottom: 4,
}

const $totalValue: TextStyle = {
  color: "#fff",
  fontSize: 26,
  fontWeight: "500",
  marginBottom: 6,
}

const $filterScroll: ViewStyle = {
  flexGrow: 0,
}

const $filterBar: ViewStyle = {
  gap: 6,
  paddingBottom: 4,
  paddingHorizontal: 12,
  paddingTop: 10,
}

const $filterPill: ViewStyle = {
  backgroundColor: "#fff",
  borderColor: "#ccc",
  borderRadius: 20,
  borderWidth: 1,
  paddingHorizontal: 13,
  paddingVertical: 5,
}

const $filterPillActive: ViewStyle = {
  backgroundColor: navy,
  borderColor: navy,
}

const $filterText: TextStyle = {
  color: "#777",
  fontSize: 12,
  fontWeight: "500",
}

const $filterTextActive: TextStyle = {
  color: "#fff",
}

const $entityText: TextStyle = {
  color: muted,
  fontSize: 11,
  paddingBottom: 4,
  paddingHorizontal: 16,
  paddingTop: 2,
}

const $portfolioHeader: ViewStyle = {
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  marginBottom: 0,
}

const $smallLabel: TextStyle = {
  color: muted,
  fontSize: 11,
  marginBottom: 2,
}

const $value: TextStyle = {
  color: "#1a1a1a",
  fontSize: 20,
  fontWeight: "500",
}

const $holdingList: ViewStyle = {
  backgroundColor: "#fff",
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
  borderColor: line,
  borderTopWidth: 0,
  borderWidth: 1,
  marginHorizontal: 12,
  overflow: "hidden",
}

const $expandRow: ViewStyle = {
  alignItems: "center",
  borderBottomColor: "#f0f0e8",
  borderBottomWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  minHeight: 48,
  paddingHorizontal: 14,
  paddingVertical: 10,
}

const $holdingNameWrap: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  flexShrink: 1,
  paddingRight: 8,
}

const $arrow: TextStyle = {
  color: "#bbb",
  fontSize: 10,
  marginLeft: 5,
}

const $rightValue: ViewStyle = {
  alignItems: "flex-end",
}

const $valueSmall: TextStyle = {
  color: "#1a1a1a",
  fontSize: 14,
  fontWeight: "500",
}

const $percent: TextStyle = {
  color: muted,
  fontSize: 11,
}

const $expandedPanel: ViewStyle = {
  backgroundColor: "#fafaf7",
  paddingHorizontal: 14,
}

const $subRow: ViewStyle = {
  borderBottomColor: "#f0f0e8",
  borderBottomWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingBottom: 7,
  paddingLeft: 16,
  paddingRight: 8,
  paddingTop: 7,
}

const $subText: TextStyle = {
  color: "#555",
  flexShrink: 1,
  fontSize: 12,
}

const $workflowRow: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  gap: 10,
  paddingVertical: 7,
}

const $rowBorder: ViewStyle = {
  borderBottomColor: "#f0f0e8",
  borderBottomWidth: 1,
}

const $workflowDot: ViewStyle = {
  alignItems: "center",
  backgroundColor: "#f0f0e8",
  borderRadius: 10,
  height: 20,
  justifyContent: "center",
  width: 20,
}

const $workflowDone: ViewStyle = {
  backgroundColor: "#D4EDDA",
}

const $workflowProgress: ViewStyle = {
  backgroundColor: "#FFF3CD",
}

const $workflowDotText: TextStyle = {
  color: "#1a1a1a",
  fontSize: 10,
}

const $profileCard: ViewStyle = {
  alignItems: "center",
  backgroundColor: "#fff",
  borderColor: line,
  borderRadius: 12,
  borderWidth: 1,
  flexDirection: "row",
  gap: 12,
  marginHorizontal: 12,
  marginVertical: 8,
  padding: 14,
}

const $profileAvatar: ViewStyle = {
  alignItems: "center",
  backgroundColor: navy,
  borderRadius: 22,
  height: 44,
  justifyContent: "center",
  width: 44,
}

const $profileAvatarText: TextStyle = {
  color: "#aac",
  fontSize: 14,
  fontWeight: "500",
}

const $profileName: TextStyle = {
  color: "#1a1a1a",
  fontSize: 15,
  fontWeight: "500",
}

const $currencyRow: ViewStyle = {
  alignItems: "center",
  borderBottomColor: "#f0f0e8",
  borderBottomWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  minHeight: 44,
  paddingVertical: 7,
}

const $currencySelected: TextStyle = {
  backgroundColor: navy,
  borderRadius: 5,
  color: "#fff",
  fontSize: 11,
  overflow: "hidden",
  paddingHorizontal: 8,
  paddingVertical: 4,
}

const $currencyUnselected: TextStyle = {
  color: muted,
  fontSize: 11,
}

const $toggleLabel: TextStyle = {
  color: "#1a1a1a",
  fontSize: 13,
}

const $switchTrack: ViewStyle = {
  backgroundColor: "#eee",
  borderColor: "#ccc",
  borderRadius: 10,
  borderWidth: 1,
  height: 20,
  padding: 1,
  width: 36,
}

const $switchTrackOn: ViewStyle = {
  backgroundColor: navy,
  borderColor: navy,
}

const $switchKnob: ViewStyle = {
  backgroundColor: "#aaa",
  borderRadius: 8,
  height: 16,
  width: 16,
}

const $switchKnobOn: ViewStyle = {
  alignSelf: "flex-end",
  backgroundColor: "#fff",
}

const $mutedLabel: TextStyle = {
  color: muted,
  fontWeight: "400",
}

import type { Block, Plan, Place } from './plan'

const imageFor = (name: string) => {
  if (/酒店|Shangri|Mandarin|Capella|Peninsula|Park Hyatt/.test(name)) return '/images/bangkok-hotel.svg'
  if (/芒果|甜饭|K\. Panich/.test(name)) return '/images/bangkok-food-mango.svg'
  if (/午餐|晚餐|NEXT2|Shang Palace|Baan Khanitha|Supanniga|RongRos|NARA|Err|Thipsamai|餐饮|贵宾室|Pad Thai|面|猪脚|粿/.test(name)) return '/images/bangkok-food-padthai.svg'
  return '/images/bangkok-food-padthai.svg'
}

const place = (id: string, name: string, address: string, link: string, note = '', images = [imageFor(name)]): Place => ({ id, name, address, link, note, images })
const block = (id: string, event = '', note = '', places: Place[] = []): Block => ({ id, span: 1, event, link: '', note, places })

const hotel = (id: string, name: string, address: string, king: string, twin: string, image: string, note: string) =>
  place(id, name, address, '', `五星级酒店；${note} 参考单晚价格（2026年12月旺季，含税情况以预订页为准；按 2026-10-31 汇率 1 THB≈¥0.1979 换算）：大床房 ${king}；双床房 ${twin}。`, [image])

const budgetHotel = (id: string, name: string, address: string, king: string, twin: string, note: string) =>
  place(id, name, address, '', `4星连锁酒店；${note} 参考单晚价格（2026年12月，含税/服务费以预订页为准；按 2026-10-31 汇率 1 THB≈¥0.1979 换算）：大床房 ${king}；双床房 ${twin}。`, ['/images/bangkok-hotel.svg'])

const hotelOptions = [
  hotel('hotel-shangri-la', 'Shangri-La Bangkok', '89 Soi Wat Suan Plu, New Road, Bangrak, Bangkok 10500', '฿6,200–6,800（约¥1,227–1,346）', '฿6,500–7,100（约¥1,286–1,405）', '/images/bangkok-hotel.svg', '湄南河畔、靠近 Saphan Taksin BTS 与 Sathorn Pier；本行程首选。'),
  hotel('hotel-mandarin', 'Mandarin Oriental, Bangkok', '48 Oriental Avenue, Bang Rak, Bangkok 10500', '฿23,000–26,000（约¥4,552–5,143）', '฿23,000–26,000（约¥4,552–5,143）', '/images/bangkok-hotel.svg', '湄南河畔老牌奢华酒店，靠近 Oriental Pier；适合重视服务与历史感。'),
  hotel('hotel-capella', 'Capella Bangkok', '300/2 Charoenkrung Road, Yannawa, Sathorn, Bangkok 10120', '฿30,000–35,000（约¥5,937–6,927）', '฿30,000–35,000（约¥5,937–6,927）', '/images/bangkok-hotel.svg', '湄南河畔、Charoen Krung 方向；房间面积大，适合重视景观与私密性。'),
  hotel('hotel-peninsula', 'The Peninsula Bangkok', '333 Charoennakorn Road, Klongsan, Bangkok 10600', '฿19,000–22,000（约¥3,760–4,354）', '฿19,500–22,500（约¥3,859–4,453）', '/images/bangkok-hotel.svg', '河对岸 Thonburi 方向，提供酒店接驳船；适合喜欢安静河景。'),
  hotel('hotel-park-hyatt', 'Park Hyatt Bangkok', 'Central Embassy, 88 Wireless Road, Lumphini, Bangkok 10330', '฿14,500–17,000（约¥2,870–3,364）', '฿14,800–17,500（约¥2,929–3,463）', '/images/bangkok-hotel.svg', 'Ploenchit 高端商圈、连接 Central Embassy；适合购物与城市景观。'),
  budgetHotel('hotel-mercure-surawong', 'Mercure Bangkok Surawong', '222 Surawong Road, Si Phraya, Bang Rak, Bangkok 10500', '฿2,200++（约¥435起）', '฿2,200++（约¥435起）', 'Accor旗下4星；官方 Advance Saver 起价，靠近 Silom / Charoen Krung。'),
  budgetHotel('hotel-mercure-siam', 'Mercure Bangkok Siam', '927 Rama I Road, Wang Mai, Pathum Wan, Bangkok 10330', '฿3,800–4,800（约¥752–950）', '฿4,000–5,000（约¥792–990）', 'Accor旗下4星；紧邻 BTS National Stadium，适合 Siam、BACC 和购物路线。'),
  budgetHotel('hotel-novotel-siam', 'Novotel Bangkok on Siam Square', '392/44 Siam Square Soi 6, Rama I Road, Bangkok 10330', '฿4,000–4,900（约¥792–970）', '฿4,200–5,000（约¥832–990）', 'Accor旗下4星；步行可达 Siam Paragon，适合首次曼谷旅行。'),
]

const breakfast = (date: string) => [
  place(`${date}-breakfast-next2`, 'NEXT2 Café｜Shangri-La Bangkok', '89 Soi Wat Suan Plu, New Road, Bangrak, Bangkok', 'https://www.shangri-la.com/bangkok/shangrila/dining/restaurants/next2/', '酒店内早餐；官方时间 06:30–10:30，行程按 09:00–10:00 安排。'),
]

const lunches = {
  '2026-12-01': [
    place('1201-l1', '机场贵宾室 / 机场简餐', 'Hong Kong International Airport Terminal 1', 'https://www.hongkongairport.com/en/dining/', '建议 11:00–12:00 在机场解决，避免赶航班。'),
    place('1201-l2', '香港机场餐饮区', 'Hong Kong International Airport Terminal 1', 'https://www.hongkongairport.com/en/dining/', '备选：到登机口后选择简餐。'),
  ],
  '2026-12-02': [
    place('1202-l1', 'Supanniga Eating Room Tha Tien', 'Riva Arun Hotel River Front, 392/25-26 Maharaj Road, Bangkok', 'https://www.supannigaeatingroom.com/contact_riva.html', '官方营业：工作日 11:00–22:00；最后点单 21:00。'),
    place('1202-l2', 'RongRos Tha-Tien', 'Tha Tien, Bangkok', 'https://rongrosdininggroup.com/', '湄南河与郑王庙景观方向；建议提前确认当日营业及预约。'),
    place('1202-l3', 'K. Panich 芒果糯米饭', '431–433 Tanao Road, Sao Chingcha, Phra Nakhon, Bangkok', 'https://guide.michelin.com/us/en/bangkok-region/bangkok/restaurant/k-panich', 'Michelin 推荐街头甜品；特色：椰香芒果糯米饭。图片为本地可预览的特色菜示意图。'),
  ],
  '2026-12-03': [
    place('1203-l1', 'Baan Khanitha & Gallery', '67–69 South Sathorn Road, Bangkok', 'https://baan-khanitha.com/', '官方营业：每日 11:00–23:00。'),
    place('1203-l2', 'Supanniga Eating Room Sathorn 10', '28 Soi Sathorn 10, Silom, Bangrak, Bangkok', 'https://www.supannigaeatingroom.com/contact_sathorn.html', '官方营业：11:30–14:30、17:30–24:00。'),
    place('1203-l3', 'Baan Phadthai', '21–23 Soi Charoen Krung 44, Bangkok 10500', 'https://www.baanphadthai.com/about', 'Michelin Bib Gourmand；特色：河虾 Pad Thai、Tub Tim Krob。图片为本地可预览的特色菜示意图。'),
  ],
  '2026-12-04': [
    place('1204-l1', 'Err Urban Rustic Thai', '2/4 Soi Sukhumvit 32, Khlong Toei, Bangkok', 'https://errurbanrusticthai.co.th/', '官方营业：周四至周二 11:00–23:00，周三休息。'),
    place('1204-l2', 'Thipsamai｜ICONSIAM', 'ICONSIAM 6F, 299 Charoen Nakhon Road, Bangkok', 'https://iconsiam.com/en/dining/thipsamai', '官方营业：每日 10:00–22:00。'),
    place('1204-l3', 'Guay Tiew Mu Rung Rueang', '10 Sukhumvit 26 Alley, Khlong Tan, Bangkok', 'https://guide.michelin.com/en/article/dining-out/michelin-guide-s-top-picks-for-bangkok-s-best-street-food-stalls', 'Michelin Bib Gourmand；特色：猪肉丸汤粉 / 干拌猪肉粉。建议现金并预留排队时间。'),
  ],
  '2026-12-05': [
    place('1205-l1', 'NEXT2 Café｜Shangri-La Bangkok', '89 Soi Wat Suan Plu, New Road, Bangrak, Bangkok', 'https://www.shangri-la.com/bangkok/shangrila/dining/restaurants/next2/', '返程日建议在酒店用早餐后，前往机场。'),
    place('1205-l2', 'Shang Palace｜Shangri-La Bangkok', 'Shangri-La Bangkok, 89 Soi Wat Suan Plu, Bangkok', 'https://www.shangri-la.com/bangkok/shangrila/dining/restaurants/shang-palace/', '返程前酒店内备选；需根据航班时间确认是否来得及。'),
  ],
} satisfies Record<string, Place[]>

const dinners = {
  '2026-12-01': [
    place('1201-d1', 'NEXT2 Café｜Shangri-La Bangkok', '89 Soi Wat Suan Plu, New Road, Bangrak, Bangkok', 'https://www.shangri-la.com/bangkok/shangrila/dining/restaurants/next2/', '河畔酒店内用餐；官方晚餐 18:00–22:00。'),
    place('1201-d2', 'Shang Palace｜Shangri-La Bangkok', 'Shangri-La Bangkok, 89 Soi Wat Suan Plu, Bangkok', 'https://www.shangri-la.com/bangkok/shangrila/dining/restaurants/shang-palace/', '酒店内粤菜备选；官方晚餐 18:00–22:00，建议预约。'),
  ],
  '2026-12-02': [
    place('1202-d1', 'Baan Khanitha by The River', '2194 Charoen Krung Road, Wat Phraya Krai, Bangkok', 'https://baan-khanitha.com/', '官方营业：16:00–24:00；河景泰菜。'),
    place('1202-d2', 'RongRos Tha-Tien', 'Tha Tien, Bangkok', 'https://rongrosdininggroup.com/', '适合安排郑王庙夜景方向；建议提前确认营业时间。'),
    place('1202-d3', 'Pad Thai Fai Ta Lu', 'Phra Nakhon, Bangkok', 'https://guide.michelin.com/us/en/bangkok-region/restaurants/bib-gourmand', 'Michelin Bib Gourmand；特色：炭火 Pad Thai，适合作为老城小吃晚餐。'),
  ],
  '2026-12-03': [
    place('1203-d1', 'Baan Khanitha & Gallery', '67–69 South Sathorn Road, Bangkok', 'https://baan-khanitha.com/', '官方营业：每日 11:00–23:00。'),
    place('1203-d2', 'Supanniga Eating Room Sathorn 10', '28 Soi Sathorn 10, Silom, Bangrak, Bangkok', 'https://www.supannigaeatingroom.com/contact_sathorn.html', '官方晚餐时段 17:30–24:00。'),
    place('1203-d3', 'Sanyod Sathon-Bang Rak', '89 Soi Charat Wiang, Silom, Bangkok 10500', 'https://guide.michelin.com/th/en/article/features/why-bangkok-is-a-street-food-capital-and-these-are-street-bites-to-try', 'Michelin Bib Gourmand；特色：炭烧烧鸭鸡蛋面、粤式小菜。'),
  ],
  '2026-12-04': [
    place('1204-d1', 'Err Urban Rustic Thai', '2/4 Soi Sukhumvit 32, Khlong Toei, Bangkok', 'https://errurbanrusticthai.co.th/', '官方营业：周四至周二 11:00–23:00，周三休息。'),
    place('1204-d2', 'NARA Thai Cuisine｜ICONSIAM', 'ICONSIAM 3F, 299 Charoen Nakhon Road, Bangkok', 'https://iconsiam.com/th/dining/nara-thai-cuisine', '官方营业：每日 10:00–21:00。'),
    place('1204-d3', 'Guay Jub Mr. Joe', '313/7 Soi Chan 42–44, Wat Phraya Krai, Bangkok', 'https://guide.michelin.com/en/article/dining-out/michelin-guide-s-top-picks-for-bangkok-s-best-street-food-stalls', 'Michelin Bib Gourmand；特色：胡椒汤粿条、脆皮烧肉。'),
  ],
  '2026-12-05': [
    place('1205-d1', '香港机场餐饮区', 'Hong Kong International Airport Terminal 1', 'https://www.hongkongairport.com/en/dining/', '抵达香港后晚餐备选。'),
    place('1205-d2', '香港机场贵宾室 / 餐厅', 'Hong Kong International Airport Terminal 1', 'https://www.hongkongairport.com/en/dining/', '返港后可在机场解决晚餐。'),
  ],
} satisfies Record<string, Place[]>

const day = (date: string, entries: Array<[number, number, string, string, Place[]?]>): Block[] => {
  const blocks: Block[] = []
  let hour = 0
  let n = 0
  for (const [start, end, event, note, places] of entries) {
    while (hour < start) {
      const empty = block(`${date}-empty-${hour}`, '', '')
      empty.span = 1
      blocks.push(empty)
      hour += 1
    }
    const item = block(`${date}-event-${n++}`, event, note, places ?? [])
    item.span = end - start
    blocks.push(item)
    hour = end
  }
  while (hour < 24) {
    blocks.push(block(`${date}-empty-${hour}`, '', ''))
    hour += 1
  }
  return blocks
}

export const bangkokPlan: Plan = {
  start: '2026-12-01',
  end: '2026-12-05',
  days: {
    '2026-12-01': day('2026-12-01', [
      [9, 11, '前往香港机场', '交通：深圳湾口岸/跨境巴士或高铁转机场快线，预估 1.5–2.5 小时；香港出发旅客直接前往 HKG。'],
      [11, 14, '机场值机与午餐', '航班：国泰 CX751，HKG 14:30 → BKK 16:40（当地时间）；建议至少提前 3 小时到达机场。', lunches['2026-12-01']],
      [14, 17, '飞往曼谷', '真实航班：Cathay Pacific CX751，香港国际机场 T1 14:30 起飞，曼谷素万那普机场 16:40 抵达；飞行约 3 小时 10 分钟。'],
      [17, 18, '前往酒店与入住', '交通：机场 Rail Link / 打车；Rail Link 转 BTS 约 45–60 分钟，出租车约 40–60 分钟，视交通而定。以下为 5 家五星级酒店候选；价格是 2026 年 12 月旺季参考区间，具体房型、税费和余房以预订时为准。', hotelOptions],
      [19, 21, '晚餐', '交通：酒店内步行；抵达日不再安排外出。', dinners['2026-12-01']],
    ]),
    '2026-12-02': day('2026-12-02', [
      [9, 10, '早餐', '酒店早餐。', breakfast('2026-12-02')],
      [10, 12, '大皇宫与玉佛寺 Sightseeing', '交通：酒店打车约 20–35 分钟；景点步行游览约 2 小时。建议穿着遮肩、过膝服装；门票和开放安排以官方当天公告为准。', [place('1202-sight-grand', '大皇宫与玉佛寺', 'Na Phra Lan Road, Bangkok', 'https://www.royalgrandpalace.th/', '曼谷核心历史景点；建议提前核对开放时间与着装要求。')]],
      [12, 14, '午餐', '交通：从大皇宫步行/短途打车至 Tha Tien，约 10–20 分钟。', lunches['2026-12-02']],
      [14, 17, '卧佛寺 → 郑王庙 → 湄南河', '交通：卧佛寺步行约 10 分钟；Tha Tien 乘渡船到郑王庙约 5–15 分钟含等船；全程景点游览约 3 小时。', [place('1202-sight-river', '卧佛寺、郑王庙与湄南河', 'Tha Tien Pier, Bangkok', 'https://www.tourismthailand.org/Attraction/wat-pho', '建议安排渡船体验；渡船班次、票价与开放时间以现场为准。')]],
      [17, 19, 'Tha Tien 河畔 City Walk', '交通：步行约 1–2 公里，约 30–45 分钟；沿河观景并前往晚餐地点。', [place('1202-walk', 'Tha Tien 河畔 City Walk', 'Tha Tien, Bangkok', 'https://www.tourismthailand.org/', '适合日落前后散步，注意河岸台阶与人流。')]],
      [19, 21, '晚餐', '交通：步行或短途打车约 10–20 分钟；郑王庙 / Tha Tien 方向晚餐。', dinners['2026-12-02']],
    ]),
    '2026-12-03': day('2026-12-03', [
      [9, 10, '早餐', '酒店早餐。', breakfast('2026-12-03')],
      [10, 12, '曼谷艺术文化中心与暹罗 City Walk', '交通：BTS Saphan Taksin → Siam，约 20–30 分钟；BACC、Siam Square、Siam Paragon 步行串联约 2 小时。', [place('1203-siam', 'BACC 与 Siam Square City Walk', '939 Rama I Road, Bangkok', 'https://www.bacc.or.th/', '室内艺术空间与街区步行结合；展览开放时间以官方公告为准。')]],
      [12, 14, '午餐', '交通：Siam 区步行；Siam / Sathorn 方向午餐。', lunches['2026-12-03']],
      [14, 17, 'ICONSIAM 与河畔观景', '交通：BTS Siam → Saphan Taksin，转 Sathorn Pier 船到 ICONSIAM，约 35–50 分钟；商场与河景约 3 小时。', [place('1203-iconsiam', 'ICONSIAM 与湄南河河景', '299 Charoen Nakhon Road, Bangkok', 'https://www.iconsiam.com/', '适合避暑、购物和观景；图片为曼谷河岸城市景观参考。')]],
      [17, 19, '酒店休息 / Sathorn 漫步', '交通：从 ICONSIAM 乘船返回 Sathorn Pier，再步行回酒店约 30–45 分钟；可沿 Charoen Krung 轻松散步。', [place('1203-sathorn', 'Charoen Krung / Sathorn City Walk', 'Charoen Krung Road, Bangkok', 'https://www.tourismthailand.org/', '保留弹性，炎热或下雨时可直接回酒店休息。')]],
      [19, 21, '晚餐', 'Sathorn / 河畔晚餐。', dinners['2026-12-03']],
    ]),
    '2026-12-04': day('2026-12-04', [
      [9, 10, '早餐', '酒店早餐。', breakfast('2026-12-04')],
      [10, 12, '乍都乍周边 / 曼谷生活 City Walk', '交通：BTS Saphan Taksin → Mo Chit，约 35–50 分钟；根据当日开放情况选择 Chatuchak 周边，步行约 2 小时。', [place('1204-chatuchak', 'Chatuchak City Walk', 'Kamphaeng Phet 3 Road, Bangkok', 'https://www.tourismthailand.org/', '周末市场与街区体验；市场摊位和开放区域以当日为准。')]],
      [12, 14, '午餐', '交通：BTS 返回 Siam 或前往 ICONSIAM，约 35–50 分钟；安排在商场内，方便下午室内活动。', lunches['2026-12-04']],
      [14, 17, 'ICONSIAM 与 Chao Phraya 河景', '交通：从 Siam 乘 BTS 到 Saphan Taksin 后转船，约 35–50 分钟；商场与河岸观景约 3 小时。', [place('1204-iconsiam', 'ICONSIAM 与 Chao Phraya 河景', '299 Charoen Nakhon Road, Bangkok', 'https://www.iconsiam.com/', '适合购买伴手礼、看河景和室内休息。')]],
      [17, 19, '曼谷夜景观景', '交通：ICONSIAM 内步行；河岸观景约 1–2 小时。选择酒店河景、ICONSIAM 外沿或预约夜景酒吧，提前确认着装要求。', [place('1204-night', '湄南河夜景', 'ICONSIAM River Park, Bangkok', 'https://www.iconsiam.com/', '日落时间和现场活动以当天为准。')]],
      [19, 21, '晚餐', '交通：餐厅位于 Siam / ICONSIAM / Sukhumvit 方向，打车约 20–45 分钟；最后一晚优先选择已核实营业时间的餐厅。', dinners['2026-12-04']],
    ]),
    '2026-12-05': day('2026-12-05', [
      [9, 10, '退房与前往机场', '不安排早餐环节；如需早餐请在酒店自行解决。交通：酒店打车前往 BKK，预估 40–60 分钟；建议 10:00 离开，航班前约 3 小时到达机场。'],
      [10, 13, '机场值机与午餐', '航班：国泰 CX618，BKK 13:05 → HKG 17:00（当地时间）；在机场办理值机并用午餐。', lunches['2026-12-05']],
      [13, 17, '飞往香港', '真实航班：Cathay Pacific CX618，曼谷素万那普机场 13:05 起飞，香港国际机场 17:00 抵达；飞行约 2 小时 55 分钟。'],
    ]),
  },
}

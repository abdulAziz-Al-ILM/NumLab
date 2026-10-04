# NumLab UZ — topshirish va himoya qilish bo‘yicha qisqa qo‘llanma

## 1. Loyiha nima?

**NumLab UZ** — Sonli usullar fanidagi asosiy algoritmlarni faqat hisoblab bermasdan, ularning bajarilish jarayonini qadam-baqadam ko‘rsatadigan o‘zbek tilidagi interaktiv laboratoriya.

Asosiy tamoyil:

> **Hisoblash → qadamlar → xatolik → vizualizatsiya → xulosa**

## 2. Domlaga 30 soniyada tushuntirish

“Ustoz, men Sonli usullar mavzularini bitta interaktiv laboratoriyaga jamladim. Dastur faqat javobni chiqarmaydi. Har bir metodda boshlang‘ich ma’lumotdan boshlab iteratsiyalarni ketma-ket ko‘rsatadi, xatolik mezonini tekshiradi va natijani grafik yoki jadval bilan vizuallashtiradi. Shu sabab undan hisoblash vositasi sifatida ham, darsda algoritmni tushuntirish vositasi sifatida ham foydalanish mumkin.”

## 3. 5 daqiqalik demo tartibi

### 1-daqiqa — Ildiz topish
- Standart misolni qoldiring: `x*x*x - x - 2`
- **Bisection** ni bosing.
- Faqat birinchi qadam chiqadi.
- **Keyingi** tugmasi bilan 2–3 iteratsiyani oching.
- “3 usulni taqqosla” ni bosing.
- Newton, Secant va Bisection iteratsiyalar sonini ko‘rsating.

**Aytiladigan fikr:** “Bu yerda talaba natija qayerdan kelganini ko‘radi.”

### 2-daqiqa — Gauss
- Tayyor 3×3 sistemani yeching.
- Qator almashtirishlarini birma-bir oching.
- Oxiridagi **‖Ax−b‖∞ residual** tekshiruvini ko‘rsating.

**Aytiladigan fikr:** “Dastur natijani boshlang‘ich sistemaga qayta qo‘yib tekshiradi.”

### 3-daqiqa — Interpolatsiya
- Lagrange ni bosing.
- Bazis ko‘phadlarning bittasini oching.
- So‘ng **Chebishev demo** ni ko‘rsating.

**Aytiladigan fikr:** “Keyingi ilmiy yo‘nalish — tugun tanlashining xatolikka ta’siri va Runge fenomeni.”

### 4-daqiqa — Integral / ODE
- Simpson usulini ko‘rsating.
- n=4,8,16,32,64 da natijaning yaqinlashishini oching.
- ODE bo‘limida Eyler va RK4 ni taqqoslang.

**Aytiladigan fikr:** “Bu modul metodlarni bir xil boshlang‘ich shartda taqqoslashga imkon beradi.”

### 5-daqiqa — PDE
- Laplace masalasini Jacobi bilan yeching.
- 1-, 2-, 5-, 10-... iteratsiyalarda xatolik va markaziy qiymat qanday o‘zgarishini ko‘rsating.
- Heatmap’ni ko‘rsating.

## 4. Loyihaning ilmiy-amaliy yangiligi

NumLab’ning kuchli tomoni alohida formulalarni kodlash emas. Asosiy qiymat:
1. bir nechta sonli metodni yagona muhitda birlashtirish;
2. algoritmning ichki qadamlarini didaktik ko‘rsatish;
3. konvergentsiya va residual orqali natijani tekshirish;
4. metodlarni bir xil shartlarda taqqoslash;
5. o‘zbek tilidagi interfeys;
6. tashqi kutubxonasiz offline ishlash.

## 5. Domla berishi mumkin bo‘lgan savollar

### “Nega Newton har doim yaxshi emas?”
Newton tez yaqinlashishi mumkin, lekin boshlang‘ich nuqta va hosilaning xatti-harakatiga sezgir. Bisection sekinroq, ammo ildiz intervalda qamalgan bo‘lsa barqarorroq.

### “Gaussda nega satr almashtiryapsiz?”
Partial pivoting nol yoki juda kichik tayanch elementdan qochadi va sonli barqarorlikni yaxshilaydi.

### “Residual nima?”
Topilgan x yechimni boshlang‘ich Ax=b sistemaga qayta qo‘yib, Ax−b farqini hisoblaymiz. U nolga yaqin bo‘lsa yechim hisoblash jihatdan mos.

### “Simpson nega n juft bo‘lishini talab qiladi?”
Har bir parabola ikkita kichik intervalni qoplaydi. Shu sabab interval soni juft olinadi.

### “Eyler va RK4 farqi nima?”
Eyler bir qadamda bitta slope ishlatadi; RK4 esa to‘rtta slope orqali qadam ichidagi xatti-harakatni yaxshiroq hisobga oladi.

### “Jacobi qachon to‘xtaydi?”
Ikki ketma-ket iteratsiya orasidagi maksimal o‘zgarish berilgan ε dan kichik bo‘lganda.

## 6. Maqola uchun keyingi bosqich

Tavsiya etiladigan nom:

**“Sonli usullarni o‘qitishda qadam-baqadam vizuallashtirish va xatolik tahliliga asoslangan interaktiv laboratoriya ishlab chiqish”**

Eksperimentlar:
- Bisection / Newton / Secant konvergentsiyasi;
- tekis va Chebishev tugunlarida interpolatsiya xatoligi;
- Trapetsiya / Simpson konvergentsiyasi;
- Eyler / RK4 xatolik tartibi;
- Jacobi / Gauss–Seidel taqqoslanishi.

## 7. Topshirishdan oldin

- GitHub Pages’ni yoqing.
- Live linkni tekshiring.
- Bitta standart misolni barcha bo‘limlarda oldindan sinab ko‘ring.
- Himoyada birdan hamma qadamni ochmang — **Keyingi** tugmasi bilan algoritmni gapirib boring.

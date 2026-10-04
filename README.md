# NumLab UZ

**NumLab UZ** — sonli usullarni hisoblash, tushuntirish va vizuallashtirish uchun o‘zbek tilidagi interaktiv laboratoriya.

> Maqsad: faqat yakuniy javobni berish emas, balki **algoritm jarayoni, iteratsiya, xatolik va yaqinlashishni ko‘rsatish**.

## Live demo

GitHub Pages ishga tushirilgach:

**https://abdulaziz-al-ilm.github.io/NumLab/**

## Academic v2 imkoniyatlari

- **Qadam-baqadam rejim** — natija birdan ochilmaydi; algoritm bosqichlari ketma-ket ko‘rsatiladi.
- **Oldingi / Keyingi / Hammasini och** boshqaruvi.
- **Metodlarni taqqoslash** — ildiz topish, integral va ODE bo‘limlarida.
- **Residual va konvergentsiya tekshiruvi**.
- **Chebishev tugunlari demo**si.
- **PDF / Print** uchun akademik ko‘rinish.
- Domlaga topshirish bo‘yicha [himoya qo‘llanmasi](docs/SUBMISSION_GUIDE.md).

## Hozirgi modullar

### 1. Algebraik va transendent tenglamalar
- Bisection
- Newton
- Secant
- Iteratsiya jadvali
- Funksiya grafigi
- Xatolik nazorati

### 2. Chiziqli tenglamalar sistemasi
- Gauss usuli
- Partial pivoting
- Elementar almashtirishlarning har bir bosqichi
- Yakuniy yechim

### 3. Interpolatsiya
- Lagrange
- Newton bo‘lingan ayirmalar
- Interpolant grafigi
- Berilgan nuqtadagi qiymat

### 4. Taqribiy integrallash
- O‘rta to‘g‘ri to‘rtburchak
- Trapetsiya
- Simpson
- n oshganda yaqinlashish jadvali

### 5. Oddiy differensial tenglamalar
- Eyler
- Runge–Kutta 4
- Qadamlar jadvali
- Yechim trayektoriyasi

### 6. Elliptik PDE
- Laplace tenglamasi
- To‘r metodi
- Jacobi iteratsiyasi
- Heatmap
- Markaziy kesim

## Ishga tushirish

Hech qanday server yoki dependency shart emas.

1. Reponi clone qiling.
2. `index.html` faylini brauzerda oching.

```bash
git clone https://github.com/abdulAziz-Al-ILM/NumLab.git
cd NumLab
xdg-open index.html
```

## Nega bu loyiha?

Sonli usullarda talaba formulani ishlatib natija olishi mumkin, ammo ko‘pincha:
- metod qanday yaqinlashayotganini;
- iteratsiyalar orasidagi farqni;
- xatolik qanchalik tez kamayishini;
- turli metodlar o‘rtasidagi amaliy farqni

ko‘rmaydi.

NumLab UZ shu jarayonlarni **ko‘rinadigan** qiladi.

## Ilmiy-amaliy yo‘nalish

Loyiha quyidagi tadqiqotlar uchun tayyor asos beradi:
- Bisection, Newton va Secant konvergentsiyasini solishtirish;
- Trapetsiya va Simpson usullarida xatolikning n ga bog‘liqligini o‘rganish;
- Eyler va RK4 aniqligini taqqoslash;
- to‘r o‘lchami oshganda Laplace tenglamasi yechimining barqarorligini tahlil qilish.

Batafsil konsepsiya: [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md)

## Roadmap

- [ ] Chebishev tugunlari
- [ ] Interpolatsiya xatoligi va Runge fenomeni
- [ ] Gauss–Seidel va SOR
- [ ] Avtomatik metod taqqoslash
- [ ] CSV/PDF laboratoriya hisoboti
- [ ] Tayyor tajribalar banki
- [ ] Testlar
- [ ] PWA/offline install
- [ ] Inglizcha interfeys

## Texnologiyalar

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API

Framework va tashqi kutubxona yo‘q — loyiha internet bo‘lmasa ham ishlaydi.

## Muallif

**Abdulaziz To‘lqinov**  
Andijon davlat universiteti — Amaliy matematika

## Holat

**v2.0 — Academic Edition / ready for classroom demonstration**

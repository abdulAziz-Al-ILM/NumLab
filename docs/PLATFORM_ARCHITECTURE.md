# ILM Mizan MathLab — Platform Architecture

## Vision

MathLab universitetdagi formulaga boy, abstrakt fanlarni bitta umumiy o‘qitish mexanizmi orqali interaktiv laboratoriyaga aylantiradi.

## Universal lesson contract

- motivation — nima uchun kerak
- intuition — sodda mental model
- theory — matematik ta’rif/formula
- paper_steps — qo‘lda bajarish
- visualizer — grafik/animatsiya
- solver — foydalanuvchi inputi
- verification — xatolik/residual
- tradeoffs — afzallik/kamchilik
- practice — mashq
- report — laboratoriya hisoboti

## Target structure

MathLab/
  core/
    expression-engine
    step-engine
    graph-engine
    lesson-engine
    verification-engine
    report-engine
  subjects/
    numerical-methods
    functional-analysis
    pde
    modeling
    python
    problem-solving
  research/
    learning-evaluation

## Cross-subject graph

Real problem → Mathematical Modeling → PDE/ODE → Functional Analysis → Numerical Methods → Python → Problem Solving

## Product principles

1. Talabalar uchun bepul.
2. Uzbek-first, keyin ko‘p tilli.
3. “Sehrli javob” yo‘q: hosil bo‘lish jarayoni ko‘rinadi.
4. Har bir vizual matematik g‘oyani tushuntirishi kerak.
5. Har bir solver shartlar va failure mode’larni ko‘rsatadi.
6. Foydalanuvchi o‘zining mos masalasini kirita oladi.
7. Talaba usulni qog‘ozda qayta bajara olishi kerak.
8. O‘qituvchi shu sahifani dars demonstratsiyasi sifatida ishlata olishi kerak.
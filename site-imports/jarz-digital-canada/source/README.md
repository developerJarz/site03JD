# Jarz Digital proposal app (React + TypeScript)

App version of the 6-month growth proposal with the ads profit calculator. Dark design matching jarzdigital.com.

- `npm run dev` — live preview at http://127.0.0.1:5173
- `npm run build` — makes `dist/index.html`, one offline file. Copy it to `../Jarz-Digital-Proposal-v2/Jarz-Digital-Proposal-App.html`.

## Where to edit
- `src/calc/model.ts` — all calculation formulas (funnel, returns, repeat buyers, break-even, 6-month forecast, budget scaling).
- `src/calc/presets.ts` — business-type starting values (Bangladesh estimates) and default inputs (budget $300, min $50).
- `src/calc/strings.ts` — calculator and menu wording, English + Bangla.
- `src/content/en.json`, `bn.json` — proposal text, exported from `../proposal-source/copy_*.py`. Re-export after editing the Python copy:
  `cd ../proposal-source && python3 -c "import json,sys;sys.path.insert(0,'.');from copy_en import EN;from copy_bn import BN;[json.dump(L,open(f'../proposal-app/src/content/{L[\"lang\"]}.json','w',encoding='utf-8'),ensure_ascii=False,indent=1) for L in (EN,BN)]"`
- `src/components/Pages.tsx` — Home, Results, Market, Plan, Packages screens. `Calculator.tsx` — calculator screen.
- `src/styles.css` — design tokens at the top (colors, fonts).

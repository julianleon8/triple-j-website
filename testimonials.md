# Testimonials

Add each real review below. When you have enough, tell Claude to pull these into the website
and replace the placeholder cards in `src/components/sections/Testimonials.tsx`.

The card data type is `{ quote, attribution, rating }`. **Attribution** is a short
project + city tag like `"Welded carport · Temple, TX"` — that's what shows under
each card on the dark marquee. If you want the reviewer's name visible too, prepend
it: `"Maria G. · Welded carport · Temple, TX"`. Format: one block per review,
separated by `---`.

---
Name: 
Project:
City: , TX
Quote: ""
Rating: 5

---
Name: 
Project:
City: , TX
Quote: ""
Rating: 5

---
Name: 
Project:
City: , TX
Quote: ""
Rating: 5

---
Name: 
Project:
City: , TX
Quote: ""
Rating: 5

---
Name: 
Project:
City: , TX
Quote: ""
Rating: 5

---
Name: 
Project:
City: , TX
Quote: ""
Rating: 5

---

## Notes for Julian

- Copy the quote text directly from Google — don't paraphrase
- Include the reviewer's first name + last initial (e.g., "Maria G.") if you want
  it visible on the card; otherwise the attribution is project + city only
- City should be where the job was done, not necessarily where the customer lives
- Aim for 6–8 reviews minimum before swapping out the placeholders
- The card design assumes "Verified Project" label + 1-line attribution underneath;
  keep attributions short (~40 chars) so they don't wrap on mobile

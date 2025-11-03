SkapEdit is a wip editor for skap maps.

> Note:
> -
> SkapEdit is my first React project so idk what I'm doing. 
> I *am* trying to do stuff without too many libraries, but 
> if you know some better way of doing something, do tell me!

## Contribution
If you want to add/edit translations, you can do so in `/src/components/translate/translation/{lang}.ts`. Each entry of the record passed to `makeTranslator` represents a translation. It can be:
- A string
- A number
- An array of any of the above
- A function, taking in the associated "props" and a translator function, returning any of the above

See types `RichText` and `Translator` in `/src/components/translate/richtext.ts` and `/src/components/translate/translate.ts` respectively for more info.
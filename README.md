# ESI-Browser

Small module to make unauthenticated requests to Eve Online's ESI API
from the browser.

* Stores the retrieved result in `localStorage`
* Respects the `Expires` and `ETag` headers

## Install

```
npm i @art-of-coding/esi-browser
```

## Usage

To request information about a type:

```ts
import fetchFromEsi from '@art-of-coding/esi-browser'

const typeId = 36
const data = await fetchFromESI(`/universe/types/${typeId}/`)

console.log(`This item is called ${data.name}`)
```

## License

Copyright 2021 Michiel van der Velde.

This software is licensed under [the MIT License](LICENSE).

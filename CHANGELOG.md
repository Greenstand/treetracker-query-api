# [1.35.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.34.0...v1.35.0) (2022-08-15)

### Features

- add continent to response [#141](https://github.com/Greenstand/treetracker-query-api/issues/141) ([e35f5ab](https://github.com/Greenstand/treetracker-query-api/commit/e35f5abb8dabab1eadd3e2ee6d231cc0d5ae011c))

# [1.34.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.33.0...v1.34.0) (2022-08-12)

### Features

- implemented Get /trees?planter_id=1&order_by=created_at&desc=true ([56ed8b1](https://github.com/Greenstand/treetracker-query-api/commit/56ed8b1b9c082cf1ce6bce93718e8ab7572adc4d))

# [1.33.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.32.0...v1.33.0) (2022-08-04)

### Features

- org featured api ([038ea38](https://github.com/Greenstand/treetracker-query-api/commit/038ea38781870f60b4794f538c00569c56d88b6d))
- planter featured ([a764c0a](https://github.com/Greenstand/treetracker-query-api/commit/a764c0a6d5b17a9960b70d9e866a40f78179b7c6))

# [1.32.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.31.0...v1.32.0) (2022-08-04)

### Features

- use config table to get featured tree ([ebfdbf5](https://github.com/Greenstand/treetracker-query-api/commit/ebfdbf5dad5986321401c87bd4decd1be9c6918e))

# [1.31.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.30.0...v1.31.0) (2022-07-22)

### Features

- add /grower-accounts queries ([36283f8](https://github.com/Greenstand/treetracker-query-api/commit/36283f89fbbc04e8040ce1a775d60be3cc65f33c))
- add files to start making grower-account query ([b340dc4](https://github.com/Greenstand/treetracker-query-api/commit/b340dc4fd5b5415254e00f2795a4e1e08db1cfb6))
- add route to get the count of raw-captures w/ or w/o filter & fix tag type ([9ca1c18](https://github.com/Greenstand/treetracker-query-api/commit/9ca1c186c159fc2bfed732e14480ebbebafc0f9e))
- add selfies query and update other grower queries ([f1d4c63](https://github.com/Greenstand/treetracker-query-api/commit/f1d4c630819c271620d5fa064154a9ffb5257ace))
- work on grower_account query (need data to test) ([8f84a5c](https://github.com/Greenstand/treetracker-query-api/commit/8f84a5c2ac1d19a30cec91898d2265cec94b6a41))

# [1.30.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.29.0...v1.30.0) (2022-07-05)

### Bug Fixes

- changed url structure ([af5850f](https://github.com/Greenstand/treetracker-query-api/commit/af5850f54fc8d79b624a11712d03db9c03799faf))

### Features

- added endpoint for getting total no of token/trees per continent for a gived wallet id ([6c74951](https://github.com/Greenstand/treetracker-query-api/commit/6c749515d3ff3261ba877aef615b19c951c3df15))

# [1.29.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.28.0...v1.29.0) (2022-07-04)

### Features

- extended token endpoint to return basic tree info ([5a64edd](https://github.com/Greenstand/treetracker-query-api/commit/5a64edd48e83bc9f7d33129e9a6e4cc941ee9e6c))

# [1.28.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.27.0...v1.28.0) (2022-07-02)

### Bug Fixes

- adjust limit to allow for capture exports ([ae3535c](https://github.com/Greenstand/treetracker-query-api/commit/ae3535caed8c621c4bd74d519c72f9d15d2b27c6))
- query for getting raw-capture by id ([c0239ba](https://github.com/Greenstand/treetracker-query-api/commit/c0239bac8e20e9627707e0622281174b7c53e2f0))

### Features

- add route for raw-captures to allow filter by capture_tag ([77f9ccd](https://github.com/Greenstand/treetracker-query-api/commit/77f9ccd2d71b3251cd835533ab47e022f86cc47f))
- add route to get the count of captures w/ or w/o filter ([9bc12cc](https://github.com/Greenstand/treetracker-query-api/commit/9bc12cc35cbf235fc549c4bf80de553099ca99f9))
- add sorting back and update capture query with alt joins ([97307ab](https://github.com/Greenstand/treetracker-query-api/commit/97307ab06a8f6f55d3c713984a9206d4460ce663))

# [1.27.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.26.0...v1.27.0) (2022-06-28)

### Bug Fixes

- adjust response data to match api conventions ([76b3492](https://github.com/Greenstand/treetracker-query-api/commit/76b3492591d3d06e2de84ba35d49bcb49c8c67ca))

### Features

- add database scripts ([deb8da1](https://github.com/Greenstand/treetracker-query-api/commit/deb8da1ba17bcdd19fae171b2d7b1811acbb9edc))
- add filering captures by id, organization_id, tokenized, and reference_id ([e21e8b6](https://github.com/Greenstand/treetracker-query-api/commit/e21e8b6de956ac2e826f91f5f437928f9ed38ab9))
- add getCount() to get total results, reduce device info returned ([50d689a](https://github.com/Greenstand/treetracker-query-api/commit/50d689acc4246d0ccc6c13ebdc4b94aadaf21fd9))
- add tags array to /v2/captures/:id query ([63e3163](https://github.com/Greenstand/treetracker-query-api/commit/63e31631d428fbf56b56c2dc52be0dcf984d8118))
- update captures queries ([0145bbc](https://github.com/Greenstand/treetracker-query-api/commit/0145bbc780da78130f4dc1147c929984fbc59b11))
- update yaml with /v2/captures updates ([1f9f90f](https://github.com/Greenstand/treetracker-query-api/commit/1f9f90f7452f5e2e57dcda8cc8d8eb7001531337))

# [1.26.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.25.0...v1.26.0) (2022-06-27)

### Features

- added filter by wallet_id for species endpoint ([97bbec8](https://github.com/Greenstand/treetracker-query-api/commit/97bbec8c05612567aaeba5ab6535c29fa0632e6e))

# [1.25.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.24.1...v1.25.0) (2022-06-17)

### Bug Fixes

- update test file as per review ([30c6a7c](https://github.com/Greenstand/treetracker-query-api/commit/30c6a7c494852187eff537a8d2263bc4bb293bb1))

### Features

- get-token-list-by-filter,-support-pagination ([d7f573f](https://github.com/Greenstand/treetracker-query-api/commit/d7f573fea2ae899aa86cec32ef676fbd9395e8f8))

## [1.24.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.24.0...v1.24.1) (2022-06-14)

### Bug Fixes

- can send wallet name as a query param to the get walletByIdOrName endpoint ([3d88d29](https://github.com/Greenstand/treetracker-query-api/commit/3d88d297a5fcb9c2412a6db760ab79a4a3c480c0))

# [1.24.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.23.0...v1.24.0) (2022-06-09)

### Features

- extend the BaseRepository to support getByFilter method with offset argument ([fe70b44](https://github.com/Greenstand/treetracker-query-api/commit/fe70b445dda7b540354e79cf5ac0d272620f030f))

# [1.23.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.22.0...v1.23.0) (2022-06-08)

### Bug Fixes

- countries are now consistent with continent ([17ab4ad](https://github.com/Greenstand/treetracker-query-api/commit/17ab4ad70101483538b2f417e691ce9cc85ac386))

### Features

- endpoint planters/id now return continent and country name ([4002efb](https://github.com/Greenstand/treetracker-query-api/commit/4002efbca0893398458c322717d50812922f5786))

# [1.22.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.21.0...v1.22.0) (2022-06-02)

### Features

- endpoint get/tree/ now returns organization_id and organization_name ([4670031](https://github.com/Greenstand/treetracker-query-api/commit/4670031dd4f4ba645128433efdb5bd5c96a23508)), closes [#105](https://github.com/Greenstand/treetracker-query-api/issues/105)

# [1.21.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.20.0...v1.21.0) (2022-05-30)

### Features

- endpoint get/tree/id now returns species and country info ([c46676f](https://github.com/Greenstand/treetracker-query-api/commit/c46676f625c5bc14881f875c4240c71a097d2a6d)), closes [#104](https://github.com/Greenstand/treetracker-query-api/issues/104)

# [1.20.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.19.0...v1.20.0) (2022-05-28)

### Bug Fixes

- added test for the endpoint and updated api yaml file ([1e763f4](https://github.com/Greenstand/treetracker-query-api/commit/1e763f4a1ac53174e9194a351e36086918cccebc))
- added test for the endpoint and updated api yaml file ([55f580a](https://github.com/Greenstand/treetracker-query-api/commit/55f580aa7f8b61ec9fff7c5777f0ecd75425b191))
- rolled back package.json,changelog.md to the previous stable verified commit ([72d85a2](https://github.com/Greenstand/treetracker-query-api/commit/72d85a23fc99ecfef880472162630dc23d04371d))

### Features

- added support tag query parameter for the endpoint /trees? ([0321507](https://github.com/Greenstand/treetracker-query-api/commit/03215076dbb1e8d6b671c9f15dc5e301b3ced1b2)), closes [#52](https://github.com/Greenstand/treetracker-query-api/issues/52)

# [1.19.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.18.3...v1.19.0) (2022-05-24)

### Features

- implement denormalized API for GET /v2/captures/id ([75d1771](https://github.com/Greenstand/treetracker-query-api/commit/75d1771bffbc51a1947e2df1eb0d1d988da47da7))

## [1.18.3](https://github.com/Greenstand/treetracker-query-api/compare/v1.18.2...v1.18.3) (2022-05-24)

### Bug Fixes

- deploy test ([9073481](https://github.com/Greenstand/treetracker-query-api/commit/9073481a02a94043358db9a4fdd69ace34866b21))

## [1.18.2](https://github.com/Greenstand/treetracker-query-api/compare/v1.18.1...v1.18.2) (2022-05-24)

### Bug Fixes

- deploy test ([d491d27](https://github.com/Greenstand/treetracker-query-api/commit/d491d27b7d0b5370146995f4b93011989856c7ef))

## [1.18.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.18.0...v1.18.1) (2022-05-24)

### Bug Fixes

- deploy test ([f07f4d8](https://github.com/Greenstand/treetracker-query-api/commit/f07f4d8fec6e522cfb1b4fd95f44a832d1f942d5))

# [1.18.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.17.0...v1.18.0) (2022-05-24)

### Features

- deploy test ([a6feace](https://github.com/Greenstand/treetracker-query-api/commit/a6feace86cdc60593c8810c6afe1c06a4eff663f))

# [1.17.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.16.0...v1.17.0) (2022-05-24)

### Features

- deploy test ([89460aa](https://github.com/Greenstand/treetracker-query-api/commit/89460aa92fc5103079cd720ccc53a5e0b6eae9e0))

# [1.16.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.15.0...v1.16.0) (2022-05-24)

### Features

- deploy test ([cee08a6](https://github.com/Greenstand/treetracker-query-api/commit/cee08a6975672e8c64d7d8d8e237ef0298ecfa6d))

# [1.15.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.14.1...v1.15.0) (2022-05-03)

### Features

- implement GET/planters/featured ([7bd6492](https://github.com/Greenstand/treetracker-query-api/commit/7bd6492277f79be06f85314ae6dea701d7eed3a4))

## [1.14.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.14.0...v1.14.1) (2022-04-27)

### Bug Fixes

- update planter repository to return the right planter objects as per request's organization_id ([63769e7](https://github.com/Greenstand/treetracker-query-api/commit/63769e70b2761378be578e53a709b555f2f460aa))

# [1.14.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.13.0...v1.14.0) (2022-04-20)

### Features

- update trees route to support planted date range filter ([ec72fd2](https://github.com/Greenstand/treetracker-query-api/commit/ec72fd2cdfdf4fdf417dba0413052de220784087))

# [1.13.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.12.0...v1.13.0) (2022-04-05)

### Bug Fixes

- add more data points to make test specific ([e73dd06](https://github.com/Greenstand/treetracker-query-api/commit/e73dd06daab3a4ecbc30731ff980965608dec105))

### Features

- implement v2 for get /countries/leaderboard ([1af14ae](https://github.com/Greenstand/treetracker-query-api/commit/1af14ae95c1df37e8d0f6331f24d49d42e24bbac))

# [1.12.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.11.0...v1.12.0) (2022-03-26)

### Features

- deploy to test ([0791c49](https://github.com/Greenstand/treetracker-query-api/commit/0791c49040ac3bd3f427dffe999e18ae8254963f))

# [1.11.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.10.0...v1.11.0) (2022-03-18)

### Features

- implement countries/v2 and countries/v2/[id] ([2067e6f](https://github.com/Greenstand/treetracker-query-api/commit/2067e6f64d3839fd1db835c7c24749e7b2c8314a))

# [1.10.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.9.0...v1.10.0) (2022-03-07)

### Bug Fixes

- replace filter interface with typescript partial interface ([b5f4bdc](https://github.com/Greenstand/treetracker-query-api/commit/b5f4bdc9abea522021d677e50d241cec6edffbe3))

### Features

- transactions router with resolver ([e4d361a](https://github.com/Greenstand/treetracker-query-api/commit/e4d361a6c1f33892db774ee702837198d5001dc3))

# [1.9.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.8.0...v1.9.0) (2022-02-24)

### Features

- add planter name api endpoint ([a901ba7](https://github.com/Greenstand/treetracker-query-api/commit/a901ba791257a8b33fda70ab69ab59981bceb39e))

# [1.8.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.21...v1.8.0) (2022-02-22)

### Bug Fixes

- fix the path tokens ([f10b415](https://github.com/Greenstand/treetracker-query-api/commit/f10b4158a76344580cfcfe8f8b4b8b6107bfc991))
- rename tokens.ts to Tokens.ts ([6741bac](https://github.com/Greenstand/treetracker-query-api/commit/6741bac6564907d4e80dda58788f8912a373a70a))

### Features

- add model tokens ([a533643](https://github.com/Greenstand/treetracker-query-api/commit/a53364394b74e79990f35a6e4999a79458ab6bb7))
- add route token by id ([dd73c73](https://github.com/Greenstand/treetracker-query-api/commit/dd73c7323a7dfa923f2dd0c891b74ad90bd4c64d))
- add tokens interface ([932ec46](https://github.com/Greenstand/treetracker-query-api/commit/932ec465fa6c065d4612bcb8f24cc04221d68905))
- add tokens router ([26eb257](https://github.com/Greenstand/treetracker-query-api/commit/26eb2571047e7c4eae7e0d3a5fd6ef54cdec59cb))
- add TokensRepository ([4ce03e6](https://github.com/Greenstand/treetracker-query-api/commit/4ce03e61b49ffcf230283025c3482a97ae7ae533))
- add updated_at / claim ([7bd8c52](https://github.com/Greenstand/treetracker-query-api/commit/7bd8c5248ef64e693db3ce717d054f329c584917))
- add wallet.token ([62a79f7](https://github.com/Greenstand/treetracker-query-api/commit/62a79f7a6bb0f62748542734ebaadb7802f50359))
- export the router ([80c2fe9](https://github.com/Greenstand/treetracker-query-api/commit/80c2fe9f8dd80111e69bc3410728e4d082290184))

### Reverts

- Revert "fix: update server/routers/tokensRouter.ts" ([aa4f5d3](https://github.com/Greenstand/treetracker-query-api/commit/aa4f5d3f8ffe79ca06777d3ff7f7e788d6c9904a))

## [1.7.21](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.20...v1.7.21) (2022-02-16)

### Bug Fixes

- deploy test ([443763d](https://github.com/Greenstand/treetracker-query-api/commit/443763d89da7aaca78694685971556f9f6159c8d))

## [1.7.20](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.19...v1.7.20) (2022-02-07)

### Bug Fixes

- get featured trees uses correct column name ([c2d9484](https://github.com/Greenstand/treetracker-query-api/commit/c2d9484c5f7d433cb567662e88fa81d456bfd572))

## [1.7.19](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.18...v1.7.19) (2022-02-05)

### Bug Fixes

- issue 77 ([8e1645c](https://github.com/Greenstand/treetracker-query-api/commit/8e1645c58efff4b8158bcb182ddafa4ab4b29c26))

## [1.7.18](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.17...v1.7.18) (2022-02-05)

### Bug Fixes

- deploy test ([8b71c24](https://github.com/Greenstand/treetracker-query-api/commit/8b71c246a64a730acd7fd1ed8c37de1dde508ee7))

## [1.7.17](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.16...v1.7.17) (2022-02-05)

### Bug Fixes

- deploy test ([0684bc8](https://github.com/Greenstand/treetracker-query-api/commit/0684bc8654c34eb3ab08e88364dada1e9e943c8b))

## [1.7.16](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.15...v1.7.16) (2022-02-05)

### Bug Fixes

- deploy test ([43c8f5f](https://github.com/Greenstand/treetracker-query-api/commit/43c8f5f55c1a67629110035b17d8cd51e8f9c63a))

## [1.7.15](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.14...v1.7.15) (2022-02-05)

### Bug Fixes

- deploy test ([cd9933a](https://github.com/Greenstand/treetracker-query-api/commit/cd9933a1d227d6b68b9a7cc649cffc70bd75e60d))

## [1.7.14](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.13...v1.7.14) (2022-02-05)

### Bug Fixes

- add new types ([6288df5](https://github.com/Greenstand/treetracker-query-api/commit/6288df51f2e1a7d991564c4373bbaf56df395fb9))

## [1.7.13](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.12...v1.7.13) (2022-02-04)

### Bug Fixes

- deploy test ([838ca40](https://github.com/Greenstand/treetracker-query-api/commit/838ca40d7c4bdaf49d87668151f987a10a57e739))

## [1.7.12](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.11...v1.7.12) (2022-02-04)

### Bug Fixes

- deploy test ([756d09c](https://github.com/Greenstand/treetracker-query-api/commit/756d09c0e7a18aba314b3790ab679a40ae51d346))

## [1.7.11](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.10...v1.7.11) (2022-02-04)

### Bug Fixes

- deploy test ([a05d25a](https://github.com/Greenstand/treetracker-query-api/commit/a05d25a0cae11e9c47ffe5acc694477d2dddefbb))

## [1.7.10](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.9...v1.7.10) (2022-02-04)

### Bug Fixes

- deploy test ([34217f7](https://github.com/Greenstand/treetracker-query-api/commit/34217f79dc21b7891aa1cfcf74be6580af8afd3c))

## [1.7.9](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.8...v1.7.9) (2022-02-04)

### Bug Fixes

- deploy test ([fa2aab2](https://github.com/Greenstand/treetracker-query-api/commit/fa2aab206bbc9355c42e962891324cc36261930f))

## [1.7.8](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.7...v1.7.8) (2022-02-04)

### Bug Fixes

- deploy test ([9cd2dcd](https://github.com/Greenstand/treetracker-query-api/commit/9cd2dcdb8f9dff45dfbf5d5616c683b275b5efc2))

## [1.7.7](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.6...v1.7.7) (2022-02-04)

### Bug Fixes

- deploy test ([2457230](https://github.com/Greenstand/treetracker-query-api/commit/2457230656a798266412e74f0359dfe17bd0c76f))

## [1.7.6](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.5...v1.7.6) (2022-02-04)

### Bug Fixes

- deploy test ([002a0bc](https://github.com/Greenstand/treetracker-query-api/commit/002a0bcf15f6d08f7cba68f4c0210217c0deec3d))

## [1.7.5](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.4...v1.7.5) (2022-02-04)

### Bug Fixes

- deploy test ([b9c7f4d](https://github.com/Greenstand/treetracker-query-api/commit/b9c7f4d6051b93df51fed2ea2a3bad860d115955))

## [1.7.4](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.3...v1.7.4) (2022-02-04)

### Bug Fixes

- deploy test ([e86080a](https://github.com/Greenstand/treetracker-query-api/commit/e86080a0f81ff8911bdda125a6e2d7115ef5fbcd))

## [1.7.3](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.2...v1.7.3) (2022-02-04)

### Bug Fixes

- deploy test ([6ce22e9](https://github.com/Greenstand/treetracker-query-api/commit/6ce22e998882df45f9d8c954a52d8f3996506ae3))

## [1.7.2](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.1...v1.7.2) (2022-02-04)

### Bug Fixes

- deploy test ([67d449e](https://github.com/Greenstand/treetracker-query-api/commit/67d449eb3b9d6f4838d6aed0f8a3575f230bdd86))

## [1.7.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.7.0...v1.7.1) (2022-02-03)

### Bug Fixes

- build error caused by package.json import in app ([beaad04](https://github.com/Greenstand/treetracker-query-api/commit/beaad0428694a2b8c889ef2e490600aa46b47797))

# [1.7.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.6.0...v1.7.0) (2022-02-01)

### Features

- add default order by created_at desc ([69b5e66](https://github.com/Greenstand/treetracker-query-api/commit/69b5e66d12ecb9caab6840dba4fa81546f7aa896))

# [1.6.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.5.2...v1.6.0) (2022-01-30)

### Bug Fixes

- add eslint-disable-next-line ([7aab7a0](https://github.com/Greenstand/treetracker-query-api/commit/7aab7a022ce1c2f704760cb550e4a6700fe474a0))
- change getbyidorname to getwalletbyidorname ([bc79d3c](https://github.com/Greenstand/treetracker-query-api/commit/bc79d3cc435400aa702133e1dc0b46356ccbfbd6))
- change getbyinorname to getwalletbyidname ([c77bdc4](https://github.com/Greenstand/treetracker-query-api/commit/c77bdc4d9836f9751e644701423956214e9ed580))

### Features

- add .history ([bfc78c4](https://github.com/Greenstand/treetracker-query-api/commit/bfc78c4aa505058d83184e7f4dee7e683f4f789e))
- add getbyidorname ([2d6b75c](https://github.com/Greenstand/treetracker-query-api/commit/2d6b75c3b772e045c9d656f97a64fb433fc2e5c4))
- add walletrouter ([5558fe2](https://github.com/Greenstand/treetracker-query-api/commit/5558fe25d897f0d955a8d4cc73566fd11caca11a))
- add wallets ([694f5dc](https://github.com/Greenstand/treetracker-query-api/commit/694f5dcfd79d1004704bab550e35d9cd6c24d5ab))
- add wallets ([09ab42c](https://github.com/Greenstand/treetracker-query-api/commit/09ab42c2b51847231917f92f51bb61604b51dd43))
- add wallets repository ([59f6cc5](https://github.com/Greenstand/treetracker-query-api/commit/59f6cc5e7d2cd9ed3a633137438594c202918f3b))
- add wallets router ([a0edd7f](https://github.com/Greenstand/treetracker-query-api/commit/a0edd7f4c0d3eb04c1ec831d0c0607ea45fa154f))
- add wallets' interface ([5b284d3](https://github.com/Greenstand/treetracker-query-api/commit/5b284d3576d5e774cf26518f942aecc80a8dd6b9))
- change id to walletidorname ([3808c84](https://github.com/Greenstand/treetracker-query-api/commit/3808c841fcbbf45d2b5e62f566052fe4ead9e645))
- create model wallets ([eeff066](https://github.com/Greenstand/treetracker-query-api/commit/eeff0660d7285dc7af5739ae40a9a86f26da0846))
- get wallet by id or name ([0041a49](https://github.com/Greenstand/treetracker-query-api/commit/0041a49a919f6867db3f32b3cea7e82925f8e850))

## [1.5.2](https://github.com/Greenstand/treetracker-query-api/compare/v1.5.1...v1.5.2) (2022-01-28)

### Bug Fixes

- countries should return a list ([79ebc61](https://github.com/Greenstand/treetracker-query-api/commit/79ebc61be986672ea5df72d3fbc25ab6d2fe17c2))
- return 404 when countries not found ([4f1cecb](https://github.com/Greenstand/treetracker-query-api/commit/4f1cecbc2c47544447761700c04b3bb033c16ab1))

## [1.5.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.5.0...v1.5.1) (2022-01-28)

### Bug Fixes

- 404 error returned for unknown trees and countries ([c40f0e2](https://github.com/Greenstand/treetracker-query-api/commit/c40f0e2200989d6f971b922865473e1959a5c2bf))
- updated eslint config and renamed req and next params of error handler ([9723abc](https://github.com/Greenstand/treetracker-query-api/commit/9723abc0b8719c578418095051f0c0957a488a6d))

# [1.5.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.4.1...v1.5.0) (2022-01-26)

### Bug Fixes

- remove escape characters ([064b871](https://github.com/Greenstand/treetracker-query-api/commit/064b8717f7a1b15be1d3e07620f4638849d93534))
- resolve a second conflict with main branch ([0371df4](https://github.com/Greenstand/treetracker-query-api/commit/0371df4fa16dfdb9b50dc563aede930aa13b67fe))
- resolve conflict with main branch ([d692815](https://github.com/Greenstand/treetracker-query-api/commit/d692815086db45c184a3baf195a292c208989784))
- update test with complete sql sentence & add a test without orderBy argument ([15377c1](https://github.com/Greenstand/treetracker-query-api/commit/15377c1a9d97b4ddcc7e519bd6e084f05eb0529d))

### Features

- add orderBy functionality to BaseRepository ([05bc1d3](https://github.com/Greenstand/treetracker-query-api/commit/05bc1d389ef85a67103039a7883778f77d289849))

## [1.4.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.4.0...v1.4.1) (2022-01-17)

### Bug Fixes

- org return links ([c12f754](https://github.com/Greenstand/treetracker-query-api/commit/c12f7542c3448d44f645bbc3fd3c9603b9f0a2b6))
- turn the response value into an array object ([db5bb23](https://github.com/Greenstand/treetracker-query-api/commit/db5bb234149caaed6652634cee59371ca6df5965))

# [1.4.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.3.0...v1.4.0) (2022-01-17)

### Bug Fixes

- parseCentroid.js ([3a053b6](https://github.com/Greenstand/treetracker-query-api/commit/3a053b69b7e6b1b15a34f3ce8269a4c48f448e64))
- planter return specis link ([50ef353](https://github.com/Greenstand/treetracker-query-api/commit/50ef353bda6f37f8c861d0e5c342bc85c021f375))
- species return species list ([5d28620](https://github.com/Greenstand/treetracker-query-api/commit/5d28620206aec70f3c441a5c3c0681832ce9e1f4))

### Features

- country centroid and so on ([5402145](https://github.com/Greenstand/treetracker-query-api/commit/5402145ab7ad7dd0a21264a32ad3ca600a050e7f))
- planter retun links ([1800a9b](https://github.com/Greenstand/treetracker-query-api/commit/1800a9b3fc79286df89ffba2145b3ad254e4c54f))

# [1.3.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.2.3...v1.3.0) (2022-01-15)

### Features

- added github actions to run tests for new PR ([f3b53cb](https://github.com/Greenstand/treetracker-query-api/commit/f3b53cb2f5bba0d0802d79bedf8e5f93fa87bb4d))

## [1.2.3](https://github.com/Greenstand/treetracker-query-api/compare/v1.2.2...v1.2.3) (2022-01-13)

### Bug Fixes

- resolve npm test issue ([32db813](https://github.com/Greenstand/treetracker-query-api/commit/32db813bbb40db72d94393ef48d18618783fcd14))

## [1.2.2](https://github.com/Greenstand/treetracker-query-api/compare/v1.2.1...v1.2.2) (2022-01-12)

### Bug Fixes

- wrong path ([1554c9c](https://github.com/Greenstand/treetracker-query-api/commit/1554c9c0f578f314ce42803d07b6b1a2f4a161ed))

## [1.2.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.2.0...v1.2.1) (2022-01-12)

### Bug Fixes

- wrong path ([4d12b0b](https://github.com/Greenstand/treetracker-query-api/commit/4d12b0bad778cfb3cdbdda25dcaefdff26bfe31f))

# [1.2.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.1.0...v1.2.0) (2022-01-12)

### Features

- org api ([5fe89d9](https://github.com/Greenstand/treetracker-query-api/commit/5fe89d9cc944006ad9ea45fe4526350c9fd618d8))
- planter api ([b12b2e0](https://github.com/Greenstand/treetracker-query-api/commit/b12b2e0242b9c18d8ae497d51374b9080e9fe845))
- species api ([cbde41a](https://github.com/Greenstand/treetracker-query-api/commit/cbde41ac97a450689bb392ec87a73f451105e5e4))

# [1.1.0](https://github.com/Greenstand/treetracker-query-api/compare/v1.0.4...v1.1.0) (2022-01-12)

### Features

- featured tree api ([0c7a2c5](https://github.com/Greenstand/treetracker-query-api/commit/0c7a2c58e4a023b3d412b70d7cc41dc2b89f6ff6))

## [1.0.4](https://github.com/Greenstand/treetracker-query-api/compare/v1.0.3...v1.0.4) (2022-01-08)

### Bug Fixes

- deploy test ([8712eb9](https://github.com/Greenstand/treetracker-query-api/commit/8712eb9c3495ae65cf37a65139a9e70eec78475a))

## [1.0.3](https://github.com/Greenstand/treetracker-query-api/compare/v1.0.2...v1.0.3) (2022-01-08)

### Bug Fixes

- cmd to run docker ([11aa1f0](https://github.com/Greenstand/treetracker-query-api/commit/11aa1f07fec95d5b8e70e3f2a9135ef14772ed5d))

## [1.0.2](https://github.com/Greenstand/treetracker-query-api/compare/v1.0.1...v1.0.2) (2022-01-08)

### Bug Fixes

- test cmd ([12923bc](https://github.com/Greenstand/treetracker-query-api/commit/12923bce3385a011449389753c1887a4abf06843))

## [1.0.1](https://github.com/Greenstand/treetracker-query-api/compare/v1.0.0...v1.0.1) (2022-01-08)

### Bug Fixes

- correct docker cmd to start ([6f2df81](https://github.com/Greenstand/treetracker-query-api/commit/6f2df81b5f59befd0f27c61b4949e78c8fc82029))

# 1.0.0 (2022-01-08)

### Bug Fixes

- filter bug ([1e9a189](https://github.com/Greenstand/treetracker-query-api/commit/1e9a1890fdd5ad237730d5d8f913d58ea97e2fd8))
- wrong setting ([473e0b8](https://github.com/Greenstand/treetracker-query-api/commit/473e0b8702cdc5bd1fd64547c9d7e61c79c7cb0b))

### Features

- api leader board ([4f4c8d8](https://github.com/Greenstand/treetracker-query-api/commit/4f4c8d856c90588acbac9a1d9bb815fbdb12f6d8))
- deploy setting ([3410e99](https://github.com/Greenstand/treetracker-query-api/commit/3410e99ed3fc86e8f0c908310e64969f9f02a279))
- mock server ([89ac725](https://github.com/Greenstand/treetracker-query-api/commit/89ac725dcd4a5b71e9b741fe000f50e0834fb1f3))
- remove service layer ([b79b38f](https://github.com/Greenstand/treetracker-query-api/commit/b79b38fe53e314b82e05492421099f4547be6a1d))
- support tress filter by org ([c58d647](https://github.com/Greenstand/treetracker-query-api/commit/c58d64729e7ee01087854e738063b769df2433dc))
- trees api ([c4dd49c](https://github.com/Greenstand/treetracker-query-api/commit/c4dd49c824e41b8a7423e6fca4ab889424eeb2ed))
- trees get by planter id ([2d9f4e3](https://github.com/Greenstand/treetracker-query-api/commit/2d9f4e343d9ae4cec6bd45039742cf638a3cf195))
- trees get by planter id ([32117ae](https://github.com/Greenstand/treetracker-query-api/commit/32117ae011f6c0009420cb13529a5a07d55298d4))

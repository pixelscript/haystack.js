# Haystacks.js

## Goal

To find the fastet method of searching though a large uuid set.

## Setup

Use `generator.sh` to create the test files.

`data/haystack.txt` - contains 100,000,000 uuids

`data/needles-01.txt` - contains 1000 uuids from `haystack.txt`

`data/needles-02.txt` - contains 100,000 uuids from `haystack.txt`

`data/needles-03.txt` - contains 100,000,000 uuids from `haystack.txt`

The goal is simple - find every instance of a needle that exists in the haystack.

### Round 1

`haystack.txt` is piped in via stdin.

#### Methods

* `Object.hasOwnProperty(x)`
* `Object[x]===null`
* `Set.has(x)`
* `Map.has(x)`

Discounted for being too slow:

* `Array.indexOf(x) !== -1`
* `String.indexOf(x) !== -1`
* `String.search()`
* `String.match()`

### Round 2

`haystack.txt` can be loaded in as a file.

#### Methods

Now that we have access to the direct `haystack.txt` file, we can process it to make more efficient use of our resources.

The haystack file was split up so each CPU core can process against the loaded needles file. It uses the [`cluster`](https://nodejs.org/api/cluster.html) feature of NodeJs to create workers to work on their portion of the file using the best method from Round 1:`Object.hasOwnProperty(x)`. 

# Results

## Round 1

![](/results/round1.png)

## Round 2

![](/results/round2.png)
# Haystacks.js

## Goal

To find the fastet method of searching though a large uuid set.

## Setup

Use `generator.sh` to create the test files.


`data/haystack.txt` - contains 100,000,000 uuids

`data/needles-01.txt` - contains 1000 uuids from `haystack.txt`

`data/needles-02.txt` - contains 100,000 uuids from `haystack.txt`

`data/needles-03.txt` - contains 100,000,000 uuids from `haystack.txt`

### Round 1

`haystack.txt` is piped in via stdin.

### Round 2

`haystack.txt` can be loaded in as a file.

# Results

## Round 1

![](/results/round1.png)
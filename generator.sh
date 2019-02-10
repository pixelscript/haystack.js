#!/usr/bin/env bash

echo "Generating haystack containing 100,000,000 uuids"
uuid -v4 -n100000000 > data/haystack.txt

echo "Sampling haystack for 1,000 uuids"
gshuf -n1000 data/haystack.txt > data/needles-01.txt
# uuid -v4 -n100 >> data/needles-01.txt

echo "Sampling haystack for 100,000 uuids"
gshuf -n100000 data/haystack.txt > data/needles-02.txt
# uuid -v4 -n100 >> data/needles-02.txt

echo "Sampling haystack for 1,000,000 uuids"
gshuf -n1000000 data/haystack.txt > data/needles-03.txt
# uuid -v4 -n100 >> data/needles-03.txt

echo "Generating warmup haystack"
for STRAW in a b c d e; do
  echo "${STRAW}" >> data/warmup-haystack.txt
done

echo "Generating warmup needles"
for NEEDLE in e f g; do
  echo "${NEEDLE}" >> data/warmup-needles.txt
done

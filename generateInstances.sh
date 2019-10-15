#bin/bash
for i in {50..500..50}
do
ts-node instanceGenerator.ts $i "instances/instance$i.txt"
done
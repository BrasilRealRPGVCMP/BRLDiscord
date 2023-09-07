#!/bin/sh
while true
do
node .
nvm exec 16.15.1 index.js 
echo "Para cerrar el servidor presiona CTRL y C!"
echo "Reiniciando servidor:"
for i in 1
do
echo "$i..."
sleep 1
done
echo "Reiniciado correctamente!"
done 
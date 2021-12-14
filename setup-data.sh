#!/bin/bash

HELP="usage setup-data.sh [-d <dataset-path>] [-h]
    d: Dataset path you want to use
    h: print this help message

Run this script from the root of the repository."

MORPHEUS_PUBLIC="$PWD"
MORPHEUS_DATA="$MORPHEUS_PUBLIC/data/"

while getopts "hd:" arg; do
  case $arg in
    h)
      echo "$HELP" 
      exit 0
      ;;
    d)
      DATASET=$OPTARG
      ;;
    *)
      echo "$HELP"
      exit 1
      ;;
  esac
done

if [[ ! -e $DATASET ]];
then
    echo "Dataset provided doesn't exist"
    exit 1
fi

# Do we want to overwrite the data in the public/data folder?
echo "Do you want to remove/overwrite the following path"
echo -e "\t$MORPHEUS_DATA"
echo "[y/n]"
read choice
if [[ ! $choice =~ ^[Yy][Ee][Ss]|[Yy] ]];
then
    echo "Not overwriting the data"
    exit 1
fi

rm -r "$MORPHEUS_DATA"
unzip "$DATASET" -d "$MORPHEUS_PUBLIC"

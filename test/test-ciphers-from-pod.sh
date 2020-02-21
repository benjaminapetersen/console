#!/usr/bin/env bash

# i'd like to add these as a best practice, but we are actually testing 
# failures as success case, which makes it difficult to use these
# set -o errexit
set -o nounset
set -o pipefail

# $SERVER is expected to be provided as an environment variable
# and should represent the location of the console via internal
# IP address, represented by pod.status.podIP, and including :8443.
# example: 10.128.0.30:8443
echo "connecting to console pod at ${SERVER}"
# curl --head "${SERVER}"

# ensuring openssl exists, error if command not found
RESULT=$(openssl s_client -connect "${SERVER}" 2>&1)
# echo "${RESULT}"


# ensure we ignore weak ciphers
# CBC (cipher block chaining) are no longer reliable and should not be used
# CBC ciphers use an IV (initialization vector) and a chaining mechanism.
# The chaining mechanism means that a single bit error in a ciphertext block
# will invalidate all previous blocks.  The chaining was good in that it hides
# plaintext patterns, but is inferior to other cipher modes.
INVALID_CIPHER_SAMPLE=(
  DES-CBC3-SHA                  # from QE
  RSA-AES-128-CBC-SHA256
  ECDHE-RSA-3DES-EDE-CBC-SHA    # disabled to mitigate SWEET32 attack
  RSA-3DES-EDE-CBC-SHA          # disabled to mitigate SWEET32 attack
)

printf 'testing invalid ciphers %s\n' "${INVALID_CIPHER_SAMPLE[@]}"

for CIPHER in "${INVALID_CIPHER_SAMPLE[@]}"
do
  RESULT=$(openssl s_client -connect "${SERVER}" -cipher "${CIPHER}" 2>&1)
  # we have to have the openssl command above to ensure openssl is installed, else
  # this will swallow errors.  
  if [[ $? -eq 0 ]]
  then
    echo "invalid cipher suite used to connect to console (${CIPHER})"
    # on error, dump the connection result
    echo "${RESULT}"
    exit 1
  else
    echo "invalid cipher was correctly denied (${CIPHER})" 
  fi
done


# CIPHER=ECDHE-ECDSA-CHACHA20-POLY1305 # DENIED
VALID_CIPHER_SAMPLE=(
  ECDHE-RSA-AES128-GCM-SHA256
  ECDHE-RSA-AES256-GCM-SHA384
  ECDHE-ECDSA-CHACHA20-POLY1305
  ECDHE-RSA-CHACHA20-POLY1305
)

printf 'testing valid ciphers %s\n' "${VALID_CIPHER_SAMPLE[@]}"

for CIPHER in "${VALID_CIPHER_SAMPLE[@]}"
do
  RESULT=$(openssl s_client -connect "${SERVER}" -cipher "${CIPHER}" 2>&1)
  if [[ $? -eq 0 ]]
  then
    echo "valid cipher was correctly accepted (${CIPHER})"  
  else
    echo "valid cipher suite was denied (${CIPHER})"
    # on error, dump the connection result
    echo "${RESULT}"
    exit 1
  fi
done

# final log message to make testing pod status easy
echo "success"
exit 0
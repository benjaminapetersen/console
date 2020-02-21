#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

oc project openshift-console

CONSOLEPOD=$(oc get pod -l app=console -o jsonpath="{.items[0].metadata.name}" -n openshift-console)
CONSOLE_POD_IP=$(oc get pod "${CONSOLEPOD}" --template '{{.status.podIP}}')

echo "pod ${CONSOLEPOD} at ${CONSOLE_POD_IP}"

POD_NAME="test-console-ciphers"
CONFIGMAP_NAME="${POD_NAME}"
FILE_NAME="test-ciphers-from-pod.sh"
FILE_PATH="/scripts"

# TODO: delete this
oc delete pod "${POD_NAME}"
oc delete configmap "${CONFIGMAP_NAME}"

# put the test script in a configmap in the console namespace
oc create configmap "${CONFIGMAP_NAME}" --from-file="./test/${FILE_NAME}"

# creates a POD to run the test script in the console namespace
# passes $CONSOLE_POD_IP as $SERVER environment variable
cat <<EOF | oc create -f -
apiVersion: v1
kind: Pod
metadata:
  namespace: openshift-console-test
  name: "${POD_NAME}"
spec:
  restartPolicy: Never
  containers:
  - name: "${POD_NAME}"
    image: quay.io/benjaminapetersen/console-ciphertest:latest
    command: ["/bin/bash"]
    args:
    - ${FILE_PATH}/${FILE_NAME}
    env:
    - name: SERVER
      # :8443
      value: "${CONSOLE_POD_IP}:8443"
    volumeMounts:
    - name: "${CONFIGMAP_NAME}"
      mountPath: ${FILE_PATH}
  volumes:
  - name: "${CONFIGMAP_NAME}"
    configMap:
      name: "${CONFIGMAP_NAME}"
      defaultMode: 0755
EOF

# better than sleep
oc wait --for=condition=complete --timeout=32s "pod/${POD_NAME}"

# check the logs to see that ciphers were handled as expected
LOGS=$(oc logs "${POD_NAME}")
echo "${LOGS}"

# clean up the pod and configmap before we exit
oc delete pod "${POD_NAME}"
oc delete configmap "${CONFIGMAP_NAME}"

# TODO: check container status instead of a string.
# use pod.status.containerStatuses...
if [[ "${LOGS}" == *"success"* ]]; then
  echo "server ciphers correctly handled"
  exit 0
fi

echo "server ciphers incorrectly handled"
exit 1

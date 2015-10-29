// Copyright 2015 Coinprism, Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var module = angular.module("OpenchainWallet.Controllers");

// ***** TransactionController *****
// *********************************

module.controller("TransactionInfoController", function ($scope, $rootScope, $routeParams, $route, $q, controllerService, apiService, encodingService, endpointManager, LedgerRecord) {

    if (!controllerService.ensureEndpoint())
        return;

    $rootScope.selectedTab = "home";

    var mutationHash = $routeParams.hash;
    var transactions = [];
    $scope.transactions = transactions;

    function loadEndpoint(key) {
        var endpoint = endpointManager.endpoints[key];
        
        apiService.getTransaction(endpoint, mutationHash).then(function (result) {
            if (result == null) {
                return;
            }

            var parsedTransaction = { acc_records: [], endpoint: endpoint };

            $q.all(result.mutation.records.map(function (record) {
                var key = LedgerRecord.parse(record.key);
                if (key.recordType == "ACC") {
                    parsedTransaction.acc_records.push({
                        key: key,
                        value: encodingService.decodeInt64(record.value.data)
                    });
                }
            })).then(function (result) {
                transactions.push(parsedTransaction);
            });

        });
    }

    for (var key in endpointManager.endpoints) {
        loadEndpoint(key);
    }
});

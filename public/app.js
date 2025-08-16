// 郵便局コード番号検索アプリケーション

class PostalSearchApp {
    constructor() {
        this.tokenObtained = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showSampleButton();
    }

    bindEvents() {
        // トークン取得ボタン
        document.getElementById('getTokenBtn').addEventListener('click', () => {
            this.getToken();
        });

        // 検索フォーム
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });
    }

    showSampleButton() {
        // サンプルデータボタンを追加
        const searchSection = document.querySelector('.search-section');
        const sampleButton = document.createElement('button');
        sampleButton.type = 'button';
        sampleButton.className = 'btn btn-outline-info ms-2';
        sampleButton.innerHTML = '<i class="fas fa-lightbulb me-1"></i>サンプルデータ';
        sampleButton.setAttribute('data-bs-toggle', 'modal');
        sampleButton.setAttribute('data-bs-target', '#sampleModal');

        const searchButton = document.querySelector('.btn-search');
        searchButton.parentNode.insertBefore(sampleButton, searchButton.nextSibling);
    }

    async getToken() {
        const btn = document.getElementById('getTokenBtn');
        const statusDiv = document.getElementById('tokenStatus');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>取得中...';

        try {
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                this.tokenObtained = true;
                statusDiv.innerHTML = `
                    <div class="alert alert-success alert-custom">
                        <i class="fas fa-check-circle me-2"></i>
                        ${result.message}
                    </div>
                `;
                btn.innerHTML = '<i class="fas fa-check me-2"></i>取得済み';
                btn.className = 'btn btn-success';
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div class="alert alert-danger alert-custom">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    エラー: ${error.message}
                </div>
            `;
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-unlock me-2"></i>トークンを取得';
        }
    }

    async performSearch() {
        if (!this.tokenObtained) {
            this.showAlert('先にトークンを取得してください。', 'warning');
            return;
        }

        let searchCode = document.getElementById('searchCode').value.trim();
        if (!searchCode) {
            this.showAlert('検索コードを入力してください。', 'warning');
            return;
        }

        // ハイフンを除去
        const originalSearchCode = searchCode;
        searchCode = searchCode.replace(/-/g, '');

        // ハイフンが除去された場合はユーザーに通知
        if (originalSearchCode !== searchCode) {
            console.log(`ハイフンを除去しました: ${originalSearchCode} → ${searchCode}`);
        }

        const searchData = {
            searchCode: searchCode,
            page: parseInt(document.getElementById('page').value) || 1,
            limit: parseInt(document.getElementById('limit').value) || 100,
            choikitype: parseInt(document.getElementById('choikitype').value) || 1,
            searchtype: parseInt(document.getElementById('searchtype').value) || 1
        };

        const ecUid = document.getElementById('ec_uid').value.trim();
        if (ecUid) {
            searchData.ec_uid = ecUid;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchData)
            });

            const result = await response.json();

            if (result.success) {
                this.displayResults(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showAlert(`検索エラー: ${error.message}`, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(data) {
        const resultsDiv = document.getElementById('results');

        if (!data.addresses || data.addresses.length === 0) {
            resultsDiv.innerHTML = `
                <div class="alert alert-info alert-custom">
                    <i class="fas fa-info-circle me-2"></i>
                    検索結果が見つかりませんでした。
                </div>
            `;
            return;
        }

        let resultsHTML = `
            <div class="mb-4">
                <h5>
                    <i class="fas fa-list-ul me-2"></i>
                    検索結果
                    <span class="badge badge-info">${data.addresses.length}件</span>
                </h5>
            </div>
        `;

        data.addresses.forEach((address, index) => {
            resultsHTML += this.createAddressCard(address, index + 1);
        });

        resultsDiv.innerHTML = resultsHTML;
    }

    createAddressCard(address, index) {
        const hasDigitalAddress = address.dgacode;
        const hasBusiness = address.biz_name;

        return `
            <div class="result-card card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        結果 ${index}
                    </h6>
                    <div>
                        ${hasDigitalAddress ? '<span class="badge bg-primary me-1">デジタルアドレス</span>' : ''}
                        ${hasBusiness ? '<span class="badge bg-success me-1">事業所</span>' : ''}
                        <span class="badge bg-info">${address.zip_code}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-primary">住所情報</h6>
                            <p class="mb-1">
                                <i class="fas fa-mail-bulk me-2"></i>
                                <strong>郵便番号:</strong> ${address.zip_code || 'なし'}
                            </p>
                            ${hasDigitalAddress ? `
                                <p class="mb-1">
                                    <i class="fas fa-qrcode me-2"></i>
                                    <strong>デジタルアドレス:</strong> ${address.dgacode}
                                </p>
                            ` : ''}
                            <p class="mb-1">
                                <strong>都道府県:</strong> ${address.pref_name || 'なし'}
                                ${address.pref_kana ? `(${address.pref_kana})` : ''}
                            </p>
                            <p class="mb-1">
                                <strong>市区町村:</strong> ${address.city_name || 'なし'}
                                ${address.city_kana ? `(${address.city_kana})` : ''}
                            </p>
                            <p class="mb-1">
                                <strong>町名:</strong> ${address.town_name || 'なし'}
                                ${address.town_kana ? `(${address.town_kana})` : ''}
                            </p>
                            ${address.block_name ? `
                                <p class="mb-1">
                                    <strong>番地:</strong> ${address.block_name}
                                </p>
                            ` : ''}
                        </div>
                        <div class="col-md-6">
                            ${hasBusiness ? `
                                <h6 class="text-success">事業所情報</h6>
                                <p class="mb-1">
                                    <i class="fas fa-building me-2"></i>
                                    <strong>事業所名:</strong> ${address.biz_name}
                                </p>
                                ${address.biz_kana ? `
                                    <p class="mb-1">
                                        <strong>事業所名(カナ):</strong> ${address.biz_kana}
                                    </p>
                                ` : ''}
                            ` : ''}

                            <h6 class="text-info mt-3">コード情報</h6>
                            <p class="mb-1">
                                <strong>都道府県コード:</strong> ${address.pref_code || 'なし'}
                            </p>
                            <p class="mb-1">
                                <strong>市区町村コード:</strong> ${address.city_code || 'なし'}
                            </p>

                            ${address.longitude && address.latitude ? `
                                <h6 class="text-warning mt-3">位置情報</h6>
                                <p class="mb-1">
                                    <i class="fas fa-map-pin me-2"></i>
                                    <strong>緯度:</strong> ${address.latitude}
                                </p>
                                <p class="mb-1">
                                    <i class="fas fa-map-pin me-2"></i>
                                    <strong>経度:</strong> ${address.longitude}
                                </p>
                            ` : ''}
                        </div>
                    </div>

                    ${address.address ? `
                        <hr>
                        <p class="mb-0">
                            <i class="fas fa-home me-2"></i>
                            <strong>完全住所:</strong> ${address.address}
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showAlert(message, type = 'info') {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <div class="alert alert-${type} alert-custom">
                <i class="fas fa-${type === 'danger' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        `;
    }

    showLoading(show) {
        const loadingSpinner = document.querySelector('.loading-spinner');
        const resultsDiv = document.getElementById('results');

        if (show) {
            loadingSpinner.style.display = 'block';
            resultsDiv.innerHTML = '';
        } else {
            loadingSpinner.style.display = 'none';
        }
    }
}

// サンプルデータ設定関数
function setSearchCode(code) {
    document.getElementById('searchCode').value = code;
    const modal = bootstrap.Modal.getInstance(document.getElementById('sampleModal'));
    modal.hide();
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new PostalSearchApp();
});

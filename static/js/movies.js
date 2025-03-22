// Movie management JavaScript

class MovieManager {
    constructor(options = {}) {
        this.options = {
            container: options.container || '.movie-list',
            searchInput: options.searchInput || '#movieSearch',
            filterSelect: options.filterSelect || '#movieFilter',
            sortSelect: options.sortSelect || '#movieSort',
            paginationContainer: options.paginationContainer || '.pagination',
            onMovieClick: options.onMovieClick || null
        };

        this.movies = [];
        this.filteredMovies = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;

        this.init();
    }

    init() {
        this.container = document.querySelector(this.options.container);
        this.searchInput = document.querySelector(this.options.searchInput);
        this.filterSelect = document.querySelector(this.options.filterSelect);
        this.sortSelect = document.querySelector(this.options.sortSelect);
        this.paginationContainer = document.querySelector(this.options.paginationContainer);

        this.setupEventListeners();
        this.loadMovies();
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleSearch());
        }

        if (this.filterSelect) {
            this.filterSelect.addEventListener('change', () => this.handleFilter());
        }

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.handleSort());
        }
    }

    async loadMovies() {
        try {
            const response = await fetch('/api/movies/');
            const data = await response.json();

            if (data.success) {
                this.movies = data.movies;
                this.filteredMovies = [...this.movies];
                this.renderMovies();
            } else {
                throw new Error(data.message || 'Không thể tải danh sách phim');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();

        this.filteredMovies = this.movies.filter(movie => {
            return movie.title.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm);
        });

        this.currentPage = 1;
        this.renderMovies();
    }

    handleFilter() {
        const filterValue = this.filterSelect.value;

        this.filteredMovies = this.movies.filter(movie => {
            switch (filterValue) {
                case 'now_showing':
                    return movie.status === 'now_showing';
                case 'coming_soon':
                    return movie.status === 'coming_soon';
                case 'all':
                default:
                    return true;
            }
        });

        this.currentPage = 1;
        this.renderMovies();
    }

    handleSort() {
        const sortValue = this.sortSelect.value;

        this.filteredMovies.sort((a, b) => {
            switch (sortValue) {
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                case 'release_date_asc':
                    return new Date(a.release_date) - new Date(b.release_date);
                case 'release_date_desc':
                    return new Date(b.release_date) - new Date(a.release_date);
                case 'rating_desc':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });

        this.currentPage = 1;
        this.renderMovies();
    }

    renderMovies() {
        if (!this.container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const moviesToShow = this.filteredMovies.slice(startIndex, endIndex);

        let html = '<div class="row">';

        moviesToShow.forEach(movie => {
            html += this.createMovieCard(movie);
        });

        html += '</div>';

        this.container.innerHTML = html;
        this.renderPagination();
    }

    createMovieCard(movie) {
        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 movie-card" data-movie-id="${movie.id}">
                    <img src="${movie.poster_url || 'https://via.placeholder.com/300x450'}" 
                         class="card-img-top" 
                         alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getStatusBadgeColor(movie.status)}">
                                ${this.getStatusText(movie.status)}
                            </span>
                            <span class="text-warning">
                                <i class="fas fa-star"></i> ${movie.rating}
                            </span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="/movies/${movie.slug}/" class="btn btn-primary w-100">
                            Chi Tiết
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusBadgeColor(status) {
        switch (status) {
            case 'now_showing':
                return 'success';
            case 'coming_soon':
                return 'info';
            default:
                return 'secondary';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'now_showing':
                return 'Đang Chiếu';
            case 'coming_soon':
                return 'Sắp Chiếu';
            default:
                return 'Không Xác Định';
        }
    }

    renderPagination() {
        if (!this.paginationContainer) return;

        const totalPages = Math.ceil(this.filteredMovies.length / this.itemsPerPage);

        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let html = '<nav><ul class="pagination justify-content-center">';

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        html += '</ul></nav>';

        this.paginationContainer.innerHTML = html;

        // Add click event listeners to pagination links
        const paginationLinks = this.paginationContainer.querySelectorAll('.page-link');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.renderMovies();
                }
            });
        });
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
}

// Initialize movie manager when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const movieManager = new MovieManager({
        container: '.movie-list',
        searchInput: '#movieSearch',
        filterSelect: '#movieFilter',
        sortSelect: '#movieSort',
        paginationContainer: '.pagination'
    });
});

// Export for use in other files
window.MovieManager = MovieManager;
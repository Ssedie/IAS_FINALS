@if ($rows->hasPages())
  <div class="pager">
    @if ($rows->onFirstPage())<span>&laquo; Prev</span>@else<a href="{{ $rows->previousPageUrl() }}">&laquo; Prev</a>@endif
    <span>Page {{ $rows->currentPage() }} of {{ $rows->lastPage() }}</span>
    @if ($rows->hasMorePages())<a href="{{ $rows->nextPageUrl() }}">Next &raquo;</a>@else<span>Next &raquo;</span>@endif
  </div>
@endif
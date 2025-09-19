window.onload = () => {
    const OpenGraph = e7lib.OpenGraph;

    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');

    const link_pre = document.getElementById('link_preview');
    var link_a = [];

    // 링크 오브젝트 배열
    var links_view = [], links_image = [], links_title = [], links_url = [];

    // OpenGraph 객체 생성
    const openGraph = new OpenGraph();

    // 링크들
    var links = [];

    // 배열 중복 배제기 기능
    // 2025.09.17 [23:56]
    function addArray(array, value) {

        // 중복 확인
        const isDup = array.some(arr => JSON.stringify(arr) === JSON.stringify(value));
        if (isDup) return;

        // 배열에 요소 추가
        array.push(value);
    }

    // 링크 미리보기 요소 추가 기능
    // 2025.09.17 [23:56]
    function createLink(array) {
        // 배열 초기화
        links_view.length = 0; links_image.length = 0; links_title.length = 0; links_url.length = 0;
        link_pre.innerHTML = '';

        array.forEach((link, index) => {
            // 링크 미리보기 틀 생성
            links_view[index] = document.createElement('div');
            links_view[index].classList.add('link_preview');
            links_view[index].title = link;

            // OG meta 태그 읽어오기
            openGraph.getOpenGraph(link, (html, url, data) => {
                // 썸네일 생성
                links_image[index] = document.createElement('img');
                links_image[index].classList.add('link_image');
                links_image[index].src = data.image;
                links_view[index].appendChild(links_image[index]);

                // 사이트 제목 생성
                links_title[index] = document.createElement('p');
                links_title[index].classList.add('link_title');
                links_title[index].innerText = data.title;
                links_view[index].appendChild(links_title[index]);

                // 사이트 주소 생성
                links_url[index] = document.createElement('p');
                links_url[index].classList.add('link_url');
                links_url[index].innerText = link;
                links_view[index].appendChild(links_url[index]);
            });

            // 출력
            link_pre.appendChild(links_view[index]);
        });
    }
    
    // 단축키 기능 추가
    // 2025.09.16 [18:57]
    document.onkeydown = (e) => {

        // Tab, Space 4 blanks
        if (e.key === 'Tab') {
            e.preventDefault();

            if (e.target == editor) {
                const cursorPos = editor.selectionStart;
                const textBeforeCursor = editor.value.substring(0, cursorPos);
                const textAfterCursor = editor.value.substring(cursorPos);

                editor.value = textBeforeCursor + "    " + textAfterCursor;
                editor.selectionStart = editor.selectionEnd = cursorPos + 4;
            }
        }
    }

    preview.onmouseover = (e) => {
        links_view.forEach(object => {
            object.classList.remove('on');
        });

        link_a.forEach(object => {
            if(e.target === object) {
                links_view.forEach(object2 => {
                    if (object.href === object2.title) {
                        object2.classList.add('on');
                    }
                });
            }
        });
    }

    // MarkDown 기본구조 추가
    // 2025.09.16 [22:27]
    function markdownToHtml(markdown) {
        // Header (# > h1)
        markdown = markdown.replace(/^\s*# (.*)$/gm, '<h1 class="header">$1</h1>');
        markdown = markdown.replace(/^\s*## (.*)$/gm, '<h2 class="header">$1</h2>');
        markdown = markdown.replace(/^\s*### (.*)$/gm, '<h3 class="header">$1</h3>');
        markdown = markdown.replace(/^\s*#### (.*)$/gm, '<h4 class="header">$1</h4>');
        markdown = markdown.replace(/^\s*##### (.*)$/gm, '<h5 class="header">$1</h5>');
        markdown = markdown.replace(/^\s*###### (.*)$/gm, '<h6 class="header">$1</h6>');

        // List (ex: -(*) 항목1 > <ul><li>항목1</li></ul>)
        markdown = markdown.replace(/^\- (.*)$/gm, '<ul><li>$1</li></ul>');
        markdown = markdown.replace(/^\* (.*)$/gm, '<ul><li>$1</li></ul>');
        
        // bold, italic 설정
        markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 링크 처리 (ex: [Github](https://github.com) -> <a href="https://github.com">Github</a>)
        const matches = markdown.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (matches) {
            matches.forEach(match => {
                var content = match.match(/\[([^\]]+)\]\(([^)]+)\)/);
                addArray(links, content[2]);
                createLink(links);
            });
        }
        markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="link" href="$2" target="_blank">$1</a>');
        
        
        // 5. 일반 텍스트로 돌아가면 <p> 태그로 묶어주기
        markdown = markdown.replace(/^(?!\s*$)(.*)$/gm, '<p>$1</p>');

        return markdown;
    }

    editor.oninput = () => {
        links.length = 0;
        const markdownText = editor.value;

        const htmlText = markdownToHtml(markdownText);  // 마크다운을 HTML로 변환

        preview.innerHTML = htmlText;
        link_a = document.querySelectorAll('#preview > p > a.link');
    }

}
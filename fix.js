class AbletonNoteFixer {
    constructor() {
        this.fixedBlob = null;
        this.stats = null;
        this.originalFileName = '';
        this.init();
    }

    init() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.als')) {
                this.handleFile(file);
            } else {
                alert('Please drop a valid .als file');
            }
        });

        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadFixed());
    }

    async handleFile(file) {
        if (!file) return;

        this.originalFileName = file.name;
        this.showSection('processingSection');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await this.fixAbletonFile(arrayBuffer);
            this.stats = result.stats;
            this.fixedBlob = result.blob;
            this.displayResults();
        } catch (error) {
            alert(`Error processing file: ${error.message}`);
            console.error(error);
            this.showSection('uploadSection');
        }
    }

    async fixAbletonFile(arrayBuffer) {
        const uint8Array = new Uint8Array(arrayBuffer);

        let xmlString;
        try {
            xmlString = pako.ungzip(uint8Array, { to: 'string' });
        } catch (e) {
            throw new Error('Failed to decompress .als file. Make sure it is a valid Ableton Live Set file.');
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        if (xmlDoc.querySelector('parsererror')) {
            throw new Error('Failed to parse XML. File may be severely corrupted.');
        }

        const stats = this.findAndFixDuplicateNoteIds(xmlDoc);

        const serializer = new XMLSerializer();
        const fixedXmlString = serializer.serializeToString(xmlDoc);

        const compressedData = pako.gzip(fixedXmlString);
        const blob = new Blob([compressedData], { type: 'application/octet-stream' });

        return { blob, stats };
    }

    findAndFixDuplicateNoteIds(xmlDoc) {
        const noteIdMap = new Map();
        const duplicates = new Map();

        const allElements = xmlDoc.getElementsByTagName('*');

        for (let elem of allElements) {
            const noteId = elem.getAttribute('NoteId');
            if (noteId) {
                if (!noteIdMap.has(noteId)) {
                    noteIdMap.set(noteId, []);
                }
                noteIdMap.get(noteId).push(elem);
            }
        }

        for (let [noteId, elements] of noteIdMap) {
            if (elements.length > 1) {
                duplicates.set(noteId, elements);
            }
        }

        const maxId = Math.max(...Array.from(noteIdMap.keys()).map(id => parseInt(id)));
        let nextId = maxId + 1;
        let fixedCount = 0;

        for (let [noteId, elements] of duplicates) {
            for (let i = 1; i < elements.length; i++) {
                elements[i].setAttribute('NoteId', nextId.toString());
                nextId++;
                fixedCount++;
            }
        }

        return {
            totalNotes: noteIdMap.size,
            duplicateIds: duplicates.size,
            duplicateOccurrences: Array.from(duplicates.values()).reduce((sum, arr) => sum + arr.length, 0),
            fixedCount: fixedCount,
            newIdRange: fixedCount > 0 ? { start: maxId + 1, end: nextId - 1 } : null,
            topDuplicates: Array.from(duplicates.entries())
                .map(([id, elems]) => ({ id, count: elems.length }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
        };
    }

    displayResults() {
        this.showSection('resultsSection');

        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${this.stats.totalNotes}</div>
                <div class="stat-label">Total MIDI Notes</div>
            </div>
            <div class="stat-card ${this.stats.duplicateIds > 0 ? 'stat-error' : ''}">
                <div class="stat-value">${this.stats.duplicateIds}</div>
                <div class="stat-label">Duplicate Note IDs Found</div>
            </div>
            <div class="stat-card ${this.stats.fixedCount > 0 ? 'stat-success' : ''}">
                <div class="stat-value">${this.stats.fixedCount}</div>
                <div class="stat-label">Duplicates Fixed</div>
            </div>
            ${this.stats.newIdRange ? `
            <div class="stat-card">
                <div class="stat-value">${this.stats.newIdRange.start} - ${this.stats.newIdRange.end}</div>
                <div class="stat-label">New ID Range</div>
            </div>
            ` : ''}
        `;

        if (this.stats.topDuplicates.length > 0) {
            const topDupsHtml = this.stats.topDuplicates
                .map(dup => `<li>Note ID ${dup.id}: ${dup.count} occurrences</li>`)
                .join('');

            statsGrid.innerHTML += `
                <div class="stat-card full-width">
                    <div class="stat-label">Top Duplicate IDs</div>
                    <ul class="duplicate-list">${topDupsHtml}</ul>
                </div>
            `;
        }
    }

    downloadFixed() {
        if (!this.fixedBlob) return;

        const fileName = this.originalFileName.replace('.als', '_FIXED.als');
        const url = URL.createObjectURL(this.fixedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showSection(sectionId) {
        ['uploadArea', 'processingSection', 'resultsSection'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) elem.style.display = 'none';
        });

        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AbletonNoteFixer();
});

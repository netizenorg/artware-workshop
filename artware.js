let drawing = false
let rot = 0
let osc = 0
let hue = 0
const count = 10 // usec by "spray" and "undo"

const types = ['Emojis', 'GIFs', 'Form UI']
const brushes = [
  ['🌺', '🌹', '🌸', '🌿', '🌱', '☘️', '🌊','🐳', '💧'],
  ['world', 'hotairballoon', 'dancing-girl', 'arrow', 'cd'],
  ['text', 'number', 'color', 'date', 'checkbox', 'radio', 'range']
]

// ------------------------------------------- MENU BUTTONS

function save () {
  const main = nn.get('main')
  nn.download(main)
}

function undo () {
  const main = nn.get('main')
  const children = [...main.children].slice(-10).reverse()
  children.forEach(el => main.removeChild(el))
}

nn.get('#save').on('click', save)

nn.get('#undo').on('click', undo)

nn.get('#clear').on('click', () => {
  nn.get('main').content(null)
})

nn.get('#notes').on('click', () => {
  window.location.href = 'notes.html'
})

// ------------------------------------------- DROP DOWN MENUS

const bPick = nn.get('#b-pick').set('options', brushes[0])

const bMode = nn.get('#b-mode')
  .set('options', ['default', 'spin', 'osc', 'rainbow', 'spray'])

const bType = nn.get('#b-type')
  .set('options', types)
  .on('input', function () {
    const i = types.indexOf(this.value)
    bPick.content(null)
    bPick.set('options', brushes[i])
  })

// ------------------------------------------ OTHER FUNCTIONS

function modifier (e) {
  if (bMode.value === 'spin') {
    rot += 10
    e.rotate(rot)
  } else if (bMode.value === 'osc') {
    osc += 0.1
    const s = Math.sin(osc) * 2
    e.scale(s)
  } else if (bMode.value === 'rainbow') {
    hue += 8
    e.hueRotate(hue)
  }
}

function drawEmoji (x,y) {
  const e = nn.create('h1')
    .content(bPick.value)
    .addTo('main')
    .css('pointer-events', 'none')
    .positionOrigin('center')
    .position(x, y)
  
  modifier(e)
}

function drawGif (x, y) {
  const url = `https://artware.app/gifs/${bPick.value}.gif`
  const e = nn.create('img')
    .set('src', url)
    .addTo('main')
    .css('pointer-events', 'none')
    .positionOrigin('center')
    .position(x, y)
  
  modifier(e)
}

function drawUI (x, y) {
  const e = nn.create('input')
    .set('type', bPick.value)
    .addTo('main')
    .css('pointer-events', 'none')
    .positionOrigin('center')
    .position(x, y)
  
  modifier(e)
}

function draw () {
  if (!drawing) return
  if (bMode.value === 'spray') return

  const x = nn.pointer.x
  const y = nn.pointer.y
  
  const top = nn.get('main').top
  if (y <= top) return
  
  if (bType.value === 'Emojis') drawEmoji(x, y)
  else if (bType.value === 'GIFs') drawGif(x, y)
  else if (bType.value === 'Form UI') drawUI(x, y)
}

function spray () {
  if (bMode.value !== 'spray') return
  nn.times(count, () => {
    const angle = nn.random(0, Math.PI * 2)
    const dist = Math.sqrt(nn.random(0, 1)) * 70
    const off = nn.polarToCartesian(dist, angle)
    const x = nn.pointer.x + off.x
    const y = nn.pointer.y + off.y
    if (bType.value === 'Emojis') drawEmoji(x, y)
    else if (bType.value === 'GIFs') drawGif(x, y)
    else if (bType.value === 'Form UI') drawUI(x, y)
  })
}

function touch () {
  drawing = true
}

function release () {
  drawing = false
}

function shortcuts (e) {
  const key = e.key.toLowerCase()
  if ((e.ctrlKey || e.metaKey) && key === 'z') {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && key === 's') {
    e.preventDefault()
    save()
  }
}

function info (e) {
  const id = e.target.id
  const dict = {
    'b-type': 'switch palette type',
    'b-pick': 'choose your brush',
    'b-mode': 'add modifier',
    'undo': 'undo last stroke',
    'clear': 'clear entire canvas',
    'save': 'save as HTML page'
  }  
  nn.get('#info').content(dict[id] || null)
}

// ----------------------------------- EVENT LISTENERS

nn.on('keydown', shortcuts)
nn.on('pointerdown', touch)
nn.on('pointerdown', spray)
nn.on('pointermove', draw)
nn.on('pointerup', release)
nn.on('pointercancel', release)
nn.on('pointerleave', release)
nn.get('main').on('pointerleave', release)
nn.getAll('nav > *').forEach(e => e.on('click', release))
nn.getAll('*').forEach(e => e.on('pointerover', info))
nn.get('body').css('touch-action', 'none')

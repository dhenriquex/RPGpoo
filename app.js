const textOutput = document.getElementById("text-output");

class Character {
  constructor(name, health, power, level = 1) {
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.power = power;
    this.level = level;
    this.exp = 0;
    this.alive = true;
    this.status = "normal";
    this.elementalAura = null;
    this.critChance = 0.1; // 10% chance of critical hit
  }

  showInfo() {
    const statusInfo = this.alive
      ? `Status: ${this.status}, Aura: ${this.elementalAura || "None"}`
      : "Status: DEAD";

    textOutput.innerHTML = `
            Nome: ${this.name} 
            | Nível: ${this.level}
            | HP: ${this.health}/${this.maxHealth}
            | Poder: ${this.power}
            | XP: ${this.exp}
            | ${statusInfo}
        `;
  }

  levelUp() {
    this.level++;
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.power += 5;
    textOutput.innerHTML = `🎉 ${this.name} subiu para o nível ${this.level}! 🎉`;
  }

  death() {
    this.alive = false;
    this.health = 0;
    this.status = "dead";
    textOutput.innerHTML = `☠️ ${this.name} foi derrotado! ☠️`;
  }

  addExp(amount) {
    this.exp += amount;
    if (this.exp >= 100 * this.level) {
      this.levelUp();
      this.exp = 0;
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.death();
    }
  }
}

class Warrior extends Character {
  constructor(name) {
    super(name, 150, 20);
    this.defense = 50;
    this.specialAttackCharge = 0;
    this.elementalAura = "Berserk";
  }

  attack(target) {
    if (!this.alive || !target.alive) return;

    let damage = Math.floor(Math.random() * this.power);
    const isCritical = Math.random() < this.critChance;

    if (isCritical) damage *= 2;

    // Special attack when fully charged
    if (this.specialAttackCharge >= 100) {
      damage *= 3;
      this.specialAttackCharge = 0;
      textOutput.innerHTML = `🔥 ${this.name} ATAQUE ESPECIAL! Dano: ${damage} 🔥`;
    } else {
      this.specialAttackCharge += 20;
      textOutput.innerHTML = `${this.name} atacou ${
        target.name
      }. Dano: ${damage}${isCritical ? " (CRÍTICO!)" : ""}`;
    }

    target.takeDamage(damage);
  }

  takeDamage(damage) {
    const reducedDamage = Math.max(0, damage - this.defense);
    this.health -= reducedDamage;

    if (this.health <= 0) {
      this.death();
    }
  }
}

class Sorcerer extends Character {
  constructor(name) {
    super(name, 100, 35);
    this.mana = 100;
    this.maxMana = 100;
    this.elementalAura = "Caos primordial";
  }

  attack(target) {
    if (!this.alive) {
      textOutput.innerHTML = `${this.name} não pode atacar porque está morto!`;
      return;
    }
    if (!target.alive) {
      textOutput.innerHTML = `${this.name} não pode atacar ${target.name} porque ele já está morto!`;
      return;
    }
    if (this.mana < 10) {
      textOutput.innerHTML = `${this.name} não tem mana suficiente para atacar!`;
      return;
    }

    let damage = Math.floor(Math.random() * (this.power * 2));

    // Ataque mágico com bônus elemental
    if (this.elementalAura) {
      damage = Math.floor(damage * 1.5);
      textOutput.innerHTML = `🌟 Ataque mágico ${this.elementalAura} potencializado! 🌟`;
    } else {
      textOutput.innerHTML = `${this.name} atacou ${target.name} causando ${damage} de dano!`;
    }

    this.mana -= 10; // Gasta 10 de mana para o ataque
    target.takeDamage(damage);
  }

  castSpell(target, spellType) {
    if (this.mana < 30) {
      textOutput.innerHTML = `${this.name} não tem mana suficiente para lançar magias!`;
      return;
    }

    switch (spellType) {
      case "damage":
        const spellDamage = this.power * 2;
        target.takeDamage(spellDamage);
        this.mana -= 30;
        textOutput.innerHTML = `🔮 ${this.name} lançou uma magia causando ${spellDamage} de dano em ${target.name}! 🔮`;
        break;

      default:
        textOutput.innerHTML = `O feitiço escolhido não é válido!`;
    }
  }
}
class Healer extends Character {
  constructor(name) {
    super(name, 120, 15);
    this.faith = 1000;
    this.maxFaith = 100;
    this.elementalAura = "Sagrada";
  }
  attack(target) {
    if (!this.alive) {
      textOutput.innerHTML = `${this.name} não pode atacar porque está morto!`;
      return;
    }

    if (!target.alive) {
      textOutput.innerHTML = `${this.name} não pode atacar ${target.name} porque ele já está morto!`;
      return;
    }

    if (this.faith < 10) {
      textOutput.innerHTML = `${this.name} não tem fé suficiente para realizar um ataque sagrado!`;
      return;
    }

    // Dano baseado no poder do Healer e com um bônus sagrado
    let damage = Math.floor(this.power * 1.8); // Multiplicador do ataque sagrado
    const isCritical = Math.random() < this.critChance;

    if (isCritical) {
      damage *= 2; // Dano crítico
      textOutput.innerHTML = `💥 ATAQUE SAGRADO CRÍTICO! ${this.name} infligiu ${damage} de dano em ${target.name}!`;
    } else {
      textOutput.innerHTML = `✨ Ataque Sagrado! ${this.name} causou ${damage} de dano em ${target.name}! ✨`;
    }

    target.takeDamage(damage);

    // Reduz a fé usada no ataque
    this.faith -= 10;
  }
  heal(target) {
    if (!this.alive || !target.alive) {
      textOutput.innerHTML = `${this.name} não pode curar alguém morto!`;
      return;
    }

    const healAmount =
      this.faith >= 50
        ? Math.floor(target.maxHealth * 0.5)
        : Math.floor(target.maxHealth * 0.2);

    target.health = Math.min(target.maxHealth, target.health + healAmount);
    this.faith = Math.max(0, this.faith - 20);

    textOutput.innerHTML = `✨ ${this.name} curou ${target.name} por ${healAmount} pontos de vida! ✨`;
  }
}
class Boss extends Character {
  constructor(name) {
    super(name, 10000, 100);
    this.rage = 0;
    this.maxRage = 100;
    this.elementalAura = "Diabólico";
  }

  attack(characters) {
    if (!this.alive) {
      textOutput.innerHTML = `${this.name} está morto e não pode atacar!`;
      return;
    }

    const aliveCharacters = characters.filter((char) => char.alive);
    if (aliveCharacters.length === 0) {
      textOutput.innerHTML = `${this.name} venceu a batalha, pois todos os heróis foram derrotados!`;
      return;
    }

    const target =
      aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)];

    const healthPercentage = this.health / this.maxHealth;
    let damage = Math.floor(Math.random() * this.power);

    if (healthPercentage < 0.5) damage += this.power * 0.5;
    if (healthPercentage < 0.2) damage += this.power;

    target.takeDamage(damage);

    textOutput.innerHTML = `💥 ${this.name} atacou ${target.name} causando ${damage} de dano!`;
  }

  takeDamage(damage) {
    super.takeDamage(damage);
    this.getRage();
  }

  getRage() {
    this.rage = Math.min(this.maxRage, this.rage + 10);
  }
}

// Inicialização dos personagens
const w1 = new Warrior("Leopoldo");
const s1 = new Sorcerer("Baltazar");
const h1 = new Healer("Ancião");
const b1 = new Boss("Balor");

const characters = {
  w1: w1,
  s1: s1,
  h1: h1,
};

// Eventos de botões
document
  .getElementById("warrior-attack")
  .addEventListener("click", () => w1.attack(b1));
document
  .getElementById("sorcerer-attack")
  .addEventListener("click", () => s1.attack(b1));
document
  .getElementById("healer-attack")
  .addEventListener("click", () => h1.attack(b1));

document
  .getElementById("warrior-info")
  .addEventListener("click", () => w1.showInfo());
document
  .getElementById("sorcerer-info")
  .addEventListener("click", () => s1.showInfo());
document
  .getElementById("healer-info")
  .addEventListener("click", () => h1.showInfo());
document
  .getElementById("boss-info")
  .addEventListener("click", () => b1.showInfo());

// Novos botões de ação
document.getElementById("healer-heal").addEventListener("click", () => {
  // Captura o valor do dropdown
  const selectedTarget = document.getElementById("heal-target").value;

  // Localiza o personagem correspondente
  const target = characters[selectedTarget];

  if (!target) {
    textOutput.innerHTML = "Personagem inválido!";
    return;
  }

  // Executa a cura no personagem selecionado
  h1.heal(target);

  // Atualiza as informações na tela (opcional)
});
document.getElementById("sorcerer-set-aura").addEventListener("click", () => {
  const aura = document.getElementById("sorcerer-aura").value;

  // Define a aura do mago
  s1.elementalAura = aura;
  textOutput.innerHTML = `✨ Aura Elemental do Mago definida como ${aura.toUpperCase()}! ✨`;
});
document
  .getElementById("sorcerer-special-attack")
  .addEventListener("click", () => {
    if (!s1.alive) {
      textOutput.innerHTML = "O mago está morto e não pode atacar!";
      return;
    }

    if (!s1.elementalAura) {
      textOutput.innerHTML =
        "O mago precisa de uma aura ativa para usar seu ataque especial!";
      return;
    }

    // Seleciona o Boss como alvo principal para o ataque especial
    const target = b1;

    // Calcula o dano com base na aura
    let damage = s1.power * 2; // Base do ataque especial
    if (s1.elementalAura === "fire") damage *= 1.2;
    if (s1.elementalAura === "ice") damage *= 1.1;
    if (s1.elementalAura === "lightning") damage *= 1.5;

    // Exibe mensagem especial baseada na aura
    textOutput.innerHTML = `💥 Ataque especial elemental ${
      s1.elementalAura
    } lançado! Dano: ${damage.toFixed(2)} 💥`;

    // Aplica o dano ao alvo
    target.takeDamage(damage);

    // Atualiza as informações do Boss
  });

document.getElementById("boss-at").addEventListener("click", () => {
  document.getElementById("boss-at").addEventListener("click", () => {
    const allCharacters = [w1, s1, h1]; // Lista de todos os personagens
    b1.attack(allCharacters); // Execute o ataque do Boss
    if (healthPercentage < 0.5) damage += this.power * 0.5;
    if (healthPercentage < 0.2) damage += this.power;
    // Atualize o log de texto sem apagar o anterior
    const logEntry = document.createElement("p");
    textOutput.appendChild(logEntry);
  });
});
